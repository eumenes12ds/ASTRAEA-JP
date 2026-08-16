/** 現在のユーザーが管理者かどうかをチェックする, 管理者のみがグローバル拡張機能を更新できる */
declare function isAdmin(): boolean;

/** 酒場アシスタントの拡張機能 id を取得する */
declare function getTavernHelperExtensionId(): string;

/**
 * インストール済み拡張機能のタイプを取得する
 * - `'local'`: ローカル拡張機能, 現在のユーザーのみ使用可能
 * - `'global'`: グローバル拡張機能, 酒場のすべてのユーザーが使用可能
 * - `'system'`: 酒場の内蔵拡張機能, 例えば正規表現など
 *
 * @param extension_id 拡張機能 id, 通常は拡張機能のフォルダ名
 */
declare function getExtensionType(extension_id: string): 'local' | 'global' | 'system' | null;

type ExtensionInstallationInfo = {
  current_branch_name: string;
  current_commit_hash: string;
  is_up_to_date: boolean;
  remote_url: string;
};

/**
 * 拡張機能のインストール情報を取得する
 *
 * @param extension_id 拡張機能 id, 通常は拡張機能のフォルダ名
 */
declare function getExtensionInstallationInfo(extension_id: string): Promise<ExtensionInstallationInfo | null>;

/**
 * 特定の拡張機能がインストール済みかどうかをチェックする
 *
 * @param extension_id 拡張機能 id, 通常は拡張機能のフォルダ名
 *
 * @example
 * // 酒場アシスタントがインストール済みかどうかをチェックする
 * const is_installed = isInstalledExtension(getTavernHelperExtensionId());
 */
declare function isInstalledExtension(extension_id: string): boolean;

/**
 * 拡張機能をインストールする; 新しくインストールした拡張機能はページをリフレッシュ (`triggerSlash('/reload-page')`) しないと有効にならない
 *
 * @param url 拡張機能の URL
 * @param type インストールする拡張機能のタイプ
 *   - `'local'`: ローカル拡張機能, 現在のユーザーのみ使用可能
 *   - `'global'`: グローバル拡張機能, 酒場のすべてのユーザーが使用可能
 * @returns インストールに対する応答
 *
 * @example
 * // 酒場アシスタントをインストールする
 * const response = await installExtension('https://github.com/n0vi028/JS-Slash-Runner', 'local');
 * if (response.ok) {
 *   toastr.success(`酒場アシスタントのインストールに成功しました, ページをリフレッシュして有効化します...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function installExtension(url: string, type: 'local' | 'global'): Promise<Response>;

/**
 * 拡張機能をアンインストールする; アンインストール後はページをリフレッシュ (`triggerSlash('/reload-page')`) しないと有効にならない
 *
 * @param extension_id 拡張機能 id, 通常は拡張機能のフォルダ名
 *
 * @example
 * // 酒場アシスタントをアンインストールする
 * const response = await uninstallExtension('JS-Slash-Runner');
 * if (response.ok) {
 *   toastr.success(`酒場アシスタントのアンインストールに成功しました, ページをリフレッシュして有効化します...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function uninstallExtension(extension_id: string): Promise<Response>;

/**
 * 拡張機能を再インストールする; 再インストール後はページをリフレッシュ (`triggerSlash('/reload-page')`) しないと有効にならない
 *
 * @param extension_id 拡張機能 id, 通常は拡張機能のフォルダ名
 *
 * @example
 * // 酒場アシスタントを再インストールする
 * const response = await reinstallExtension('JS-Slash-Runner');
 * if (response.ok) {
 *   toastr.success(`酒場アシスタントの再インストールに成功しました, ページをリフレッシュして有効化します...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function reinstallExtension(extension_id: string): Promise<Response>;

/**
 * 拡張機能を更新する; 更新後はページをリフレッシュ (`triggerSlash('/reload-page')`) しないと有効にならない
 *
 * @param extension_id 拡張機能 id, 通常は拡張機能のフォルダ名
 *
 * @example
 * // 酒場アシスタントを更新する
 * const response = await updateExtension('JS-Slash-Runner');
 * if (response.ok) {
 *   toastr.success(`酒場アシスタントの更新に成功しました, ページをリフレッシュして有効化します...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function updateExtension(extension_id: string): Promise<Response>;
