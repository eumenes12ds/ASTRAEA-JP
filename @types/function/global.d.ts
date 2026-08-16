/**
 * インターフェースをグローバルに共有し、他のフロントエンドUI やスクリプトから使用できるようにする.
 *
 * 他のフロントエンドUI やスクリプトは、`await waitGlobalInitialized(global)` で初期化完了を待ってから、`global` を変数名としてこのインターフェースにアクセスできる.
 *
 * @param global 共有するインターフェース名
 * @param value 共有するインターフェースの内容
 *
 * @example
 * // Mvu インターフェースをグローバルに共有する
 * initializeGlobal('Mvu', Mvu);
 * // 以後、他のフロントエンドUI やスクリプトでは `await waitGlobalInitialized('Mvu')` で初期化完了を待ってから、`Mvu` を変数名としてこのインターフェースにアクセスできる
 */
declare function initializeGlobal(global: TypeFest.LiteralUnion<'Mvu', string>, value: any): void;

/**
 * 他のフロントエンドUI やスクリプトで共有されたグローバルインターフェースの初期化完了を待ち、それを現在のフロントエンドUI やスクリプトで使用可能にする.
 *
 * これには、他のフロントエンドUI やスクリプトが `initializeGlobal(global, value)` でインターフェースを共有している必要がある.
 *
 * @param global 初期化するグローバルインターフェース名
 *
 * @example
 * await waitGlobalInitialized('Mvu');
 * ...以後は Mvu インターフェースを直接使用できる
 */
declare function waitGlobalInitialized<T>(global: TypeFest.LiteralUnion<'Mvu', string>): Promise<T>;
