/**
 * 酒場のUIと同じように、新しいキャラクターをインポートする/既存のキャラクターカードを更新する
 *
 * @param filename キャラクターカード名
 * @param content キャラクターカードのファイル内容
 *
 * @example
 * // ネットワークリンクから新しいキャラクターをインポートする/既存のキャラクターカードを更新する
 * const response = await fetch(キャラクターカードのURL);
 * await importRawCharacter(キャラクターカード名, await response.blob());
 */
declare function importRawCharacter(filename: string, content: Blob): Promise<Response>;

/**
 * 酒場のUIと同じようにチャットファイルをインポートする, 現在は選択中のキャラクターカードにのみインポートできる
 *
 * @param filename チャットファイル名, 酒場の制約により、実際には最終的にインポートされるチャットファイル名にはならない
 * @param content チャットファイルの内容
 *
 * @throws キャラクターカードが選択されていない場合、エラーをスローする
 *
 * @example
 * // ネットワークリンクからチャットファイルをインポートする
 * const response = await fetch(チャットファイルのURL);
 * await importRawChat(チャットファイル名, await response.text());
 */
declare function importRawChat(filename: string, content: string): Promise<Response>;

/**
 * 酒場のUIと同じように、新しいプリセットをインポートする/既存のプリセットを更新する
 *
 * @param filename プリセット名
 * @param content プリセットのファイル内容
 *
 * @example
 * // ネットワークリンクから新しいプリセットをインポートする/既存のプリセットを更新する
 * const response = await fetch(プリセットのURL);
 * await importRawChat(プリセット名, await response.text());
 */
declare function importRawPreset(filename: string, content: string): Promise<boolean>;

/**
 * 酒場のUIと同じように、新しいワールドブックをインポートする/既存のワールドブックを更新する
 *
 * @param filename ワールドブック名
 * @param content ワールドブックのファイル内容
 *
 * @example
 * // ネットワークリンクから新しいワールドブックをインポートする/既存のワールドブックを更新する
 * const response = await fetch(ワールドブックのURL);
 * await importRawChat(ワールドブック名, await response.text());
 */
declare function importRawWorldbook(filename: string, content: string): Promise<Response>;

/**
 * 酒場のUIと同じように酒場の正規表現をインポートする
 *
 * @param filename 酒場の正規表現名
 * @param content 酒場の正規表現のファイル内容
 *
 * @example
 * // ネットワークリンクから酒場の正規表現をインポートする
 * const response = await fetch(酒場の正規表現のURL);
 * await importRawChat(酒場の正規表現名, await response.text());
 */
declare function importRawTavernRegex(filename: string, content: string): boolean;
