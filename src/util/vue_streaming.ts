import type { App, Reactive } from 'vue';
import { uuidv4 } from './common';
import { createScriptIdDiv, createScriptIdIframe, teleportStyle } from './script';

/**
 * `mountStreamingMessages` によってマウントされたストリーミングUIが受け取るリアクティブデータ
 */
export type StreamingMessageContext = {
  prefix: string;
  host_id: string;

  message_id: number;
  message: string;
  during_streaming: boolean;
};

export function injectStreamingMessageContext(): Readonly<StreamingMessageContext> {
  return readonly(inject('streaming_message_context')!);
}

/**
 * コンポーネントをストリーミングフロアUIとして酒場の各フロアにマウントし、酒場標準のフロア本文表示を置き換えます。
 *
 * 方法は、酒場の元のフロアテキストを非表示にし、その下に `mes_streaming` というクラス名を持つ DOM を挿入することです:
 *   - `options.host==='iframe'` の場合、iframe を挿入し、その中の contentDocument.body をコンポーネントのマウントポイントにする
 *     - スタイルは酒場標準のUIから分離される
 *     - コンポーネント内で tailwindcss を使用できる
 *   - `options.host==='div'` の場合、div を挿入し、それを直接コンポーネントのマウントポイントにする
 *     - 酒場のスタイルを継承する
 *     - mes_text クラス名の使用は禁止。酒場のフロア編集機能が使えなくなるため
 *     - コンポーネント内では tailwindcss を使用できない。酒場のその他の部分のスタイルに影響するため
 *     - メッセージ内容の整形には `@types/function/displayed_message.d.ts` の `formatAsDisplayedMessage` を使い、整形後の内容に `.replaceAll('mes_text', 'mes_streaming')` を適用してスタイルを合わせるとよい
 *
 * @param creator ストリーミングUIを生成するコンポーネント。関数内で `.use` により依存関係をインストールしたり、その他のロジックを実行できる
 * @param options オプション
 *   - `host`: ホスト。デフォルトは `'iframe'`。`'iframe'` はスタイルを分離できるため、複雑なUIの実装に便利
 *   - `filter`: フロアフィルター。設定すると、条件に合うフロアのみにストリーミングフロアUIがマウントされる
 *   - `prefix`: コンポーネントのユニーク識別子。デフォルトではランダムに生成される。関数が生成するストリーミングフロアUIはこの `prefix` を共有し、`host` DOM の id は `${prefix}-${message_id}` に設定される
 * @returns ストリーミングフロアUIをアンマウントする関数
 */
export function mountStreamingMessages(
  creator: () => App,
  options: {
    host?: 'iframe' | 'div';
    filter?: (message_id: number, message: string) => boolean;
    prefix?: string;
  } = {},
): { unmount: () => void } {
  const { host = 'iframe', filter, prefix = uuidv4() } = options;

  const states: Map<
    number,
    { app: App; data: Reactive<StreamingMessageContext>; destroy: () => void }
  > = new Map();
  let has_stoped = false;

  const destroyIfInvalid = (message_id: number): boolean => {
    const min_message_id = Number($('#chat > .mes').first().attr('mesid'));
    if (!_.inRange(message_id, min_message_id, SillyTavern.chat.length)) {
      states.get(message_id)?.destroy();
      return true;
    }
    return false;
  };

  const destroyAllInvalid = () => {
    states.keys().forEach(message_id => destroyIfInvalid(message_id));
  };

  const renderOneMessage = async (message_id: number, stream_message?: string) => {
    if (has_stoped) {
      return;
    }
    if (destroyIfInvalid(message_id)) {
      return;
    }

    const message = stream_message ?? getChatMessages(message_id)[0].message ?? '';
    if (filter && !filter(message_id, message)) {
      states.get(message_id)?.destroy();
      return;
    }

    const $message_element = $(`.mes[mesid='${message_id}']`);

    const $mes_text = $message_element.find('.mes_text').addClass('hidden!');
    $message_element.find('.TH-streaming').addClass('hidden!');

    let $host = $message_element.find(`#${prefix}-${message_id}`);
    if ($host.length > 0) {
      const state = states.get(message_id);
      if (state) {
        state.data.message = message;
        state.data.during_streaming = Boolean(stream_message);
        return;
      }
    }

    states.get(message_id)?.destroy();
    $host.remove();

    let $mes_streaming = $message_element.find('.mes_streaming');
    if ($mes_streaming.length === 0) {
      $mes_streaming = $('<div class="mes_streaming">')
        .css({
          'font-weight': '500',
          'line-height': 'calc(var(--mainFontSize) + .5rem)',
          'max-width': '100%',
          'overflow-wrap': 'anywhere',
          padding: 'calc(var(--mainFontSize) * 0.8) 0 0 0',
        })
        .insertAfter($mes_text);
    }

    $host = (host === 'iframe' ? createScriptIdIframe().addClass('w-full') : createScriptIdDiv())
      .attr('id', `${prefix}-${message_id}`)
      .appendTo($mes_streaming);

    const data = reactive<StreamingMessageContext>({
      prefix,
      host_id: `${prefix}-${message_id}`,
      message_id,
      message,
      during_streaming: Boolean(stream_message),
    });
    const app = creator().provide('streaming_message_context', data);
    if (host === 'iframe') {
      $host.on('load', function (this: HTMLIFrameElement) {
        teleportStyle(this.contentDocument!.head);
        app.mount(this.contentDocument!.body);
      });
    } else {
      app.mount($host[0]);
    }

    const observer = new MutationObserver(() => {
      const $edit_textarea = $('#chat').find('#curEditTextarea');
      if ($edit_textarea.parent().is($mes_text)) {
        $mes_text.removeClass('hidden!');
        $host.addClass('hidden!');
      } else if ($edit_textarea.length === 0) {
        $mes_text.addClass('hidden!');
        $message_element.find('.TH-streaming').addClass('hidden!');
        $host.removeClass('hidden!');
      }
    });
    observer.observe($mes_text[0] as HTMLElement, { childList: true });

    states.set(message_id, {
      app,
      data,
      destroy: () => {
        const $th_streaming = $message_element.find('.TH-streaming');
        if ($th_streaming.length > 0) {
          $th_streaming.removeClass('hidden!');
        } else {
          $mes_text.removeClass('hidden!');
        }

        app.unmount();
        $host.remove();
        if ($mes_streaming.children().length === 0) {
          $mes_streaming.remove();
        }
        observer.disconnect();
        states.delete(message_id);
      },
    });
  };

  const renderAllMessage = async (
    options: { destroy_all?: boolean; trigger_event?: boolean } = {},
  ) => {
    if (has_stoped) {
      return;
    }
    if (options.destroy_all) {
      states.forEach(({ destroy }) => destroy());
    } else {
      destroyAllInvalid();
    }
    await Promise.all(
      $('#chat')
        .children(".mes[is_user='false'][is_system='false']")
        .map(async (_index, node) => {
          const message_id = Number($(node).attr('mesid') ?? 'NaN');
          if (!isNaN(message_id)) {
            await renderOneMessage(message_id);
            if (options.trigger_event) {
              eventEmit(tavern_events.CHARACTER_MESSAGE_RENDERED, message_id, 'rerender');
            }
          }
        }),
    );
  };

  const stop_list: Array<() => void> = [];
  const scopedEventOn = <T extends EventType>(
    event: T,
    listener: ListenerType[T],
    first?: true,
  ) => {
    stop_list.push(
      first
        ? eventMakeFirst(event, errorCatched(listener)).stop
        : eventOn(event, errorCatched(listener)).stop,
    );
  };
  scopedEventOn('chatLoaded', () => {
    renderAllMessage({ destroy_all: true });
  });
  scopedEventOn(
    tavern_events.CHARACTER_MESSAGE_RENDERED,
    message_id => {
      destroyAllInvalid();
      renderOneMessage(message_id);
    },
    true,
  );
  [tavern_events.MESSAGE_EDITED, tavern_events.MESSAGE_DELETED].forEach(event =>
    scopedEventOn(event, message_id => {
      destroyAllInvalid();
      states.get(message_id)?.destroy();
      renderOneMessage(message_id);
    }),
  );
  [tavern_events.MORE_MESSAGES_LOADED, tavern_events.MESSAGE_DELETED].forEach(event =>
    scopedEventOn(event, () => setTimeout(errorCatched(renderAllMessage), 1000)),
  );
  scopedEventOn(tavern_events.STREAM_TOKEN_RECEIVED, message => {
    renderOneMessage(Number($('#chat').children('.mes.last_mes').attr('mesid')), message);
  });

  if (host === 'div') {
    stop_list.push(teleportStyle().destroy);
  }
  renderAllMessage({ trigger_event: true });

  return {
    unmount: () => {
      const $th_streaming = $('#chat').find('.TH-streaming');
      if ($th_streaming.length > 0) {
        $th_streaming.removeClass('hidden!');
      } else {
        $('chat').find('.mes_text').removeClass('hidden!');
      }
      states.forEach(({ destroy }) => destroy());
      stop_list.forEach(stop => stop());
      has_stoped = true;
    },
  };
}
