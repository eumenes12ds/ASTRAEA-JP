import { FC, PointerEventHandler, RefObject, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapViewerStatus } from '../../../core/hooks/use-map-viewer';
import { MapMarker } from '../../../core/types/map-markers';
import { type MapSourceKey } from '../../../core/types/map-source-list';
import {
  DEFAULT_MARKER_COLOR,
  drawColorOptions,
  markerIconLabels,
  markerIconOptions,
} from '../../../core/utils/map-constants';
import styles from '../MapTab.module.scss';

interface MapToolbarProps {
  mapMarkerCount: number;
  markerAddMode: boolean;
  drawMode: boolean;
  mapSourceKey: MapSourceKey;
  isMarkerPanelVisible: boolean;
  onMapSourceChange: (key: MapSourceKey) => void;
  onOpenMapSource: () => void;
  onToggleDrawMode: () => void;
  onToggleWorkbench: () => void;
  drawColor: string;
  onDrawColorChange: (color: string) => void;
  onClearDraw: () => void;
  mapSourceList: Array<{
    key: MapSourceKey;
    name: string;
  }>;
}

interface MarkerWorkbenchProps {
  visible: boolean;
  drawMode: boolean;
  markerAddMode: boolean;
  markerSearch: string;
  onMarkerSearchChange: (value: string) => void;
  onToggleMarkerAddMode: () => void;
  filteredMarkers: MapMarker[];
  activeMarkerId: string | null;
  activeMarker: MapMarker | null;
  editingName: string;
  editingGroup: string;
  editingDescription: string;
  editingImageUrls: string[];
  onEditingNameChange: (value: string) => void;
  onEditingGroupChange: (value: string) => void;
  onEditingDescriptionChange: (value: string) => void;
  onEditingImageUrlsChange: (value: string[]) => void;
  onSelectMarker: (id: string | null) => void;
  onLocateMarker: (marker: MapMarker) => void;
  onUpdateMarker: (id: string, patch: Partial<MapMarker>) => void;
  onFlushMarkerUpdate: (id: string) => void;
  onDeleteMarker: (id: string) => void;
}

interface MapStageProps {
  drawMode: boolean;
  markerAddMode: boolean;
  mapViewerStatus: MapViewerStatus;
  mapLoadError: string;
  activeMarker: MapMarker | null;
  onFocusMarker: (marker: MapMarker) => void;
  inlineContainerRef: RefObject<HTMLDivElement | null>;
  inlineCanvasRef: RefObject<HTMLCanvasElement | null>;
  drawLayerClassName: string;
  drawCanvasClassName: string;
  onInlinePointerDown: PointerEventHandler<HTMLCanvasElement>;
  onInlinePointerMove: PointerEventHandler<HTMLCanvasElement>;
  onInlinePointerUp: PointerEventHandler<HTMLCanvasElement>;
  onInlinePointerLeave: PointerEventHandler<HTMLCanvasElement>;
  markerCardPortalTarget: HTMLElement | null;
  markerCardRef: RefObject<HTMLElement | null>;
  activeMarkerCardPosition: {
    left: number;
    top: number;
    visible: boolean;
  };
  markerCardReady: boolean;
}

const getToolbarDescription = (markerAddMode: boolean, drawMode: boolean) => {
  if (markerAddMode) {
    return '現在は新規マーカー追加モードです。地図の任意の場所をクリックすると配置できます。';
  }

  if (drawMode) {
    return '現在は描画モードです。地図上に直接描き、同期保存できます。';
  }

  return 'ノーマル閲覧モードでは地図マーカーをクリック選択できます。作業台は手動で開いた場合のみ集中編集に使用します。';
};

export const MapToolbar: FC<MapToolbarProps> = ({
  mapMarkerCount,
  markerAddMode,
  drawMode,
  mapSourceKey,
  isMarkerPanelVisible,
  onMapSourceChange,
  onOpenMapSource,
  onToggleDrawMode,
  onToggleWorkbench,
  drawColor,
  onDrawColorChange,
  onClearDraw,
  mapSourceList,
}) => {
  return (
    <section className={styles.toolbar}>
      <div className={styles.toolbarMain}>
        <div className={styles.toolbarIntro}>
          <span className={styles.toolbarEyebrow}>地図ステージ</span>
          <div className={styles.toolbarTitleRow}>
            <h3 className={styles.toolbarTitle}>マーカーと描画のワークスペース</h3>
            <span className={styles.toolbarMeta}>{mapMarkerCount} 個のマーカー</span>
          </div>
          <p className={styles.toolbarDescription}>
            {getToolbarDescription(markerAddMode, drawMode)}
          </p>
        </div>
        <div className={styles.toolbarActions}>
          <div className={styles.sourceActions}>
            {mapSourceList.map(source => (
              <button
                key={source.key}
                className={`${styles.sourceButton} ${
                  mapSourceKey === source.key ? styles.sourceButtonActive : ''
                }`}
                onClick={() => onMapSourceChange(source.key)}
                type="button"
              >
                {source.name}
              </button>
            ))}
          </div>
          <button
            className={`${styles.drawToggle} ${drawMode ? styles.drawToggleActive : ''}`}
            onClick={onToggleDrawMode}
            type="button"
          >
            {drawMode ? '描画を終了' : '描画を開始'}
          </button>
          <button
            type="button"
            className={`${styles.markerWorkbenchButton} ${
              isMarkerPanelVisible ? styles.markerWorkbenchButtonActive : ''
            }`}
            onClick={onToggleWorkbench}
            disabled={drawMode}
          >
            {drawMode
              ? '描画モード中は作業台を使用できません'
              : isMarkerPanelVisible
                ? 'マーカー作業台を閉じる'
                : 'マーカー作業台を開く'}
          </button>
          {drawMode && (
            <div className={styles.drawColorPalette}>
              <span className={styles.drawColorLabel}>描画色</span>
              <div className={styles.drawColorOptions}>
                {drawColorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.drawColorButton} ${
                      drawColor === color ? styles.drawColorButtonActive : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onDrawColorChange(color)}
                    aria-label={`描画色 ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
          {drawMode && (
            <button className={styles.clearButton} onClick={onClearDraw} type="button">
              描画をクリア
            </button>
          )}
          <button className={styles.clearButton} onClick={onOpenMapSource} type="button">
            現在の解像度の地図を表示
          </button>
        </div>
      </div>
    </section>
  );
};

export const MarkerWorkbench: FC<MarkerWorkbenchProps> = ({
  visible,
  drawMode,
  markerAddMode,
  markerSearch,
  onMarkerSearchChange,
  onToggleMarkerAddMode,
  filteredMarkers,
  activeMarkerId,
  activeMarker,
  editingName,
  editingGroup,
  editingDescription,
  editingImageUrls,
  onEditingNameChange,
  onEditingGroupChange,
  onEditingDescriptionChange,
  onEditingImageUrlsChange,
  onSelectMarker,
  onLocateMarker,
  onUpdateMarker,
  onFlushMarkerUpdate,
  onDeleteMarker,
}) => {
  if (drawMode || !visible) {
    return null;
  }

  return (
    <section className={styles.markerWorkbench}>
      <div className={styles.markerPanel}>
        <div className={styles.markerPanelHeader}>
          <span className={styles.markerPanelTitle}>マーカー作業台</span>
          <span className={styles.markerPanelHint}>
            {markerAddMode ? '地図をクリックしてマーカーを追加' : '検索・位置特定・詳細編集に対応'}
          </span>
        </div>
        <div className={styles.markerControls}>
          <button
            type="button"
            className={`${styles.markerButton} ${markerAddMode ? styles.markerButtonActive : ''}`}
            onClick={onToggleMarkerAddMode}
            disabled={drawMode}
          >
            {markerAddMode ? '追加をキャンセル' : 'マーカーを追加'}
          </button>
          <input
            className={styles.markerSearchInput}
            value={markerSearch}
            onChange={event => onMarkerSearchChange(event.target.value)}
            placeholder="マーカー名/グループ/説明を検索"
          />
        </div>
        <div className={styles.markerBody}>
          {!activeMarker ? (
            <div className={`${styles.markerListSection} ${styles.markerPanelPage}`}>
              <div className={styles.markerListHeader}>
                <span className={styles.markerListTitle}>マーカー一覧</span>
                <span className={styles.markerListMeta}>{filteredMarkers.length} 件</span>
              </div>
              <div className={styles.markerList}>
                {filteredMarkers.length === 0 ? (
                  <div className={styles.markerEmpty}>マーカーなし</div>
                ) : (
                  filteredMarkers.map(marker => (
                    <button
                      key={marker.id}
                      type="button"
                      className={`${styles.markerItem} ${
                        marker.id === activeMarkerId ? styles.markerItemActive : ''
                      }`}
                      onClick={() => onSelectMarker(marker.id)}
                    >
                      <div className={styles.markerItemInfo}>
                        <span
                          className={styles.markerItemDot}
                          style={{ backgroundColor: marker.color ?? DEFAULT_MARKER_COLOR }}
                        />
                        <div className={styles.markerItemText}>{marker.name || '無名のマーカー'}</div>
                      </div>
                      <div className={styles.markerItemActions}>
                        <button
                          type="button"
                          className={styles.markerLocateButton}
                          onClick={event => {
                            event.stopPropagation();
                            onLocateMarker(marker);
                          }}
                        >
                          位置を表示
                        </button>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className={`${styles.markerEditorSection} ${styles.markerPanelPage}`}>
              <div className={styles.markerEditorSectionHeader}>
                <button
                  type="button"
                  className={styles.markerBackButton}
                  onClick={() => onSelectMarker(null)}
                >
                  一覧に戻る
                </button>
                <span className={styles.markerEditorSectionMeta}>
                  {activeMarker.name || '無名のマーカー'}
                </span>
              </div>
              <div className={styles.markerEditor}>
                <>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>名称</label>
                    <input
                      className={styles.formInput}
                      value={editingName}
                      onChange={event => onEditingNameChange(event.target.value)}
                      onBlur={() => {
                        onUpdateMarker(activeMarker.id, { name: editingName });
                        onFlushMarkerUpdate(activeMarker.id);
                      }}
                      placeholder="マーカー名を入力"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>グループ</label>
                    <input
                      className={styles.formInput}
                      value={editingGroup}
                      onChange={event => onEditingGroupChange(event.target.value)}
                      onBlur={() => {
                        onUpdateMarker(activeMarker.id, { group: editingGroup });
                        onFlushMarkerUpdate(activeMarker.id);
                      }}
                      placeholder="例：都市国家 / 遺跡"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>アイコン</label>
                    <div className={styles.iconOptions}>
                      {markerIconOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className={`${styles.iconButton} ${
                            activeMarker.icon === icon ? styles.iconButtonActive : ''
                          }`}
                          onClick={() => {
                            onUpdateMarker(activeMarker.id, { icon });
                            onFlushMarkerUpdate(activeMarker.id);
                          }}
                        >
                          <i className={icon} />
                          <span className={styles.iconButtonLabel}>{markerIconLabels[icon]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>色</label>
                    <div className={styles.markerColorOptions}>
                      {drawColorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`${styles.markerColorButton} ${
                            activeMarker.color === color ? styles.markerColorButtonActive : ''
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            onUpdateMarker(activeMarker.id, { color });
                            onFlushMarkerUpdate(activeMarker.id);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>説明</label>
                    <textarea
                      className={styles.formTextarea}
                      value={editingDescription}
                      onChange={event => onEditingDescriptionChange(event.target.value)}
                      onBlur={() => {
                        onUpdateMarker(activeMarker.id, {
                          description: editingDescription,
                        });
                        onFlushMarkerUpdate(activeMarker.id);
                      }}
                      placeholder="マーカーの説明を入力"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>
                      画像リンクグループ
                      <span className={styles.formLabelHint}>
                        （1行に1リンク。複数画像のカルーセルに対応）
                      </span>
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      value={editingImageUrls.join('\n')}
                      onChange={event => {
                        const urls = event.target.value.split('\n').map(url => url.trim());
                        onEditingImageUrlsChange(urls);
                      }}
                      onBlur={() => {
                        const validUrls = editingImageUrls.filter(url => url.length > 0);
                        onUpdateMarker(activeMarker.id, { imageUrls: validUrls });
                        onFlushMarkerUpdate(activeMarker.id);
                      }}
                      placeholder="1行に1つの画像リンクを入力&#10;例：https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                    {editingImageUrls.filter(url => url.length > 0).length > 0 && (
                      <div className={styles.imagePreviewList}>
                        {editingImageUrls
                          .filter(url => url.length > 0)
                          .map((url, index) => (
                            <div key={index} className={styles.imagePreviewItem}>
                              <img
                                src={url}
                                alt={`プレビュー ${index + 1}`}
                                className={styles.imagePreviewThumb}
                                onError={event => {
                                  (event.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                className={styles.imagePreviewRemove}
                                onClick={() => {
                                  const newUrls = editingImageUrls.filter((_, i) => i !== index);
                                  onEditingImageUrlsChange(newUrls);
                                  onUpdateMarker(activeMarker.id, {
                                    imageUrls: newUrls.filter(item => item.length > 0),
                                  });
                                  onFlushMarkerUpdate(activeMarker.id);
                                }}
                              >
                                <i className="fa-solid fa-xmark" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.markerDeleteButton}
                      onClick={() => onDeleteMarker(activeMarker.id)}
                    >
                      マーカーを削除
                    </button>
                  </div>
                </>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const MapStage: FC<MapStageProps> = ({
  drawMode,
  markerAddMode,
  mapViewerStatus,
  mapLoadError,
  activeMarker,
  onFocusMarker,
  inlineContainerRef,
  inlineCanvasRef,
  drawLayerClassName,
  drawCanvasClassName,
  onInlinePointerDown,
  onInlinePointerMove,
  onInlinePointerUp,
  onInlinePointerLeave,
  markerCardPortalTarget,
  markerCardRef,
  activeMarkerCardPosition,
  markerCardReady,
}) => {
  const validImageUrls = useMemo(
    () => activeMarker?.imageUrls?.filter(url => url.trim()) ?? [],
    [activeMarker],
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeMarker?.id]);

  const activeImageUrl = validImageUrls[activeImageIndex] ?? validImageUrls[0] ?? null;
  const hasMultipleImages = validImageUrls.length > 1;

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev - 1 + validImageUrls.length) % validImageUrls.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev + 1) % validImageUrls.length);
  };

  return (
    <div className={styles.mapWorkspace}>
      <section className={styles.mapStage}>
        <div className={styles.mapStageHeader}>
          <div className={styles.mapStageStatus}>
            <span className={styles.mapStageBadge}>
              {drawMode ? '描画モード' : markerAddMode ? 'マーカー追加モード' : '閲覧モード'}
            </span>
            <span className={styles.mapStageHint}>
              {mapViewerStatus === 'loading'
                ? '地図リソース読み込み中…'
                : mapViewerStatus === 'error'
                  ? '地図の読み込みに失敗しました。しばらくしてから再試行するか、地図ソースを切り替えてください'
                  : 'ズーム・パン・マーカークリック・配置追加に対応'}
            </span>
          </div>
          <div className={styles.mapStageSelection}>
            <span className={styles.mapStageSelectionLabel}>現在選択中</span>
            {activeMarker ? (
              <button
                type="button"
                className={styles.mapStageSelectionButton}
                onClick={() => onFocusMarker(activeMarker)}
              >
                <span
                  className={styles.mapStageSelectionDot}
                  style={{ backgroundColor: activeMarker.color ?? DEFAULT_MARKER_COLOR }}
                />
                <span>{activeMarker.name || '無名のマーカー'}</span>
              </button>
            ) : (
              <div className={styles.mapStageSelectionEmpty}>マーカーが選択されていません</div>
            )}
          </div>
        </div>

        <div className={styles.mapViewport}>
          <div className={styles.mapFrame}>
            <div ref={inlineContainerRef} className={styles.mapViewer} />
            {mapViewerStatus === 'loading' && (
              <div className={styles.mapPlaceholder}>
                <span>地図読み込み中、しばらくお待ちください…</span>
              </div>
            )}

            {mapViewerStatus === 'error' && (
              <div className={styles.mapPlaceholder}>
                <span>{mapLoadError || '地図の読み込みに失敗しました。しばらくしてから再試行してください'}</span>
              </div>
            )}
            <div className={drawLayerClassName}>
              <canvas
                ref={inlineCanvasRef}
                className={drawCanvasClassName}
                onPointerDown={onInlinePointerDown}
                onPointerMove={onInlinePointerMove}
                onPointerUp={onInlinePointerUp}
                onPointerLeave={onInlinePointerLeave}
              />
            </div>
            {activeMarker &&
              !drawMode &&
              activeMarkerCardPosition.visible &&
              markerCardPortalTarget &&
              createPortal(
                <article
                  ref={markerCardRef}
                  className={styles.mapMarkerCardHost}
                  style={
                    markerCardReady
                      ? {
                          left: `${activeMarkerCardPosition.left}px`,
                          top: `${activeMarkerCardPosition.top}px`,
                        }
                      : {
                          left: '-9999px',
                          top: '0px',
                          transform: 'none',
                          visibility: 'hidden',
                          pointerEvents: 'none',
                        }
                  }
                >
                  {activeImageUrl && (
                    <div className={styles.mapMarkerCardMedia}>
                      {hasMultipleImages && (
                        <button
                          type="button"
                          className={`${styles.mapMarkerCardCarouselButton} ${styles.mapMarkerCardCarouselButtonPrev}`}
                          onClick={handlePrevImage}
                          aria-label="前の画像を表示"
                        >
                          <i className="fa-solid fa-chevron-left" />
                        </button>
                      )}
                      <img
                        src={activeImageUrl}
                        alt={`${activeMarker.name || 'マーカー'}メインビジュアル`}
                        className={styles.mapMarkerCardHeroImage}
                        onError={event => {
                          (event.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {hasMultipleImages && (
                        <>
                          <button
                            type="button"
                            className={`${styles.mapMarkerCardCarouselButton} ${styles.mapMarkerCardCarouselButtonNext}`}
                            onClick={handleNextImage}
                            aria-label="次の画像を表示"
                          >
                            <i className="fa-solid fa-chevron-right" />
                          </button>
                          <div className={styles.mapMarkerCardCarouselDots}>
                            {validImageUrls.map((_, index) => (
                              <button
                                key={`${activeMarker.id}-dot-${index}`}
                                type="button"
                                className={`${styles.mapMarkerCardCarouselDot} ${
                                  index === activeImageIndex
                                    ? styles.mapMarkerCardCarouselDotActive
                                    : ''
                                }`}
                                onClick={() => setActiveImageIndex(index)}
                                aria-label={`${index + 1} 枚目の画像を表示`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className={styles.mapMarkerCardHeader}>
                    <div className={styles.mapMarkerCardTitleBlock}>
                      <span
                        className={styles.mapMarkerCardDot}
                        style={{ backgroundColor: activeMarker.color ?? DEFAULT_MARKER_COLOR }}
                      />
                      <div className={styles.mapMarkerCardHeading}>
                        <div className={styles.mapMarkerCardTitle}>
                          {activeMarker.name || '無名のマーカー'}
                        </div>
                        <div className={styles.mapMarkerCardMeta}>
                          {activeMarker.group || '未分類'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.mapMarkerCardBody}>
                    <p className={styles.mapMarkerCardDescription}>
                      {activeMarker.description || '説明なし'}
                    </p>
                  </div>
                </article>,
                markerCardPortalTarget,
              )}
          </div>
        </div>
      </section>
    </div>
  );
};
