import OpenSeadragon from 'openseadragon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapMarker } from '../types/map-markers';
import { DEFAULT_MARKER_COLOR, DEFAULT_MARKER_ICON } from '../utils/map-constants';

interface UseMapMarkersOptions {
  viewerRef: React.RefObject<OpenSeadragon.Viewer | null>;
  classNames: {
    mapMarker: string;
    mapMarkerActive: string;
    mapMarkerDrawMode: string;
    mapMarkerIcon: string;
    mapMarkerIconNode: string;
    mapMarkerLabel: string;
  };
  drawMode?: boolean;
  onMarkerSelect?: (id: string | null) => void;
}

interface UseMapMarkersResult {
  markers: MapMarker[];
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>;
  activeMarkerId: string | null;
  setActiveMarkerId: React.Dispatch<React.SetStateAction<string | null>>;
  markerAddMode: boolean;
  setMarkerAddMode: React.Dispatch<React.SetStateAction<boolean>>;
  updateMarker: (id: string, patch: Partial<MapMarker>) => void;
  deleteMarker: (id: string) => void;
  addMarkerAt: (nx: number, ny: number) => void;
  focusMarker: (marker: MapMarker) => void;
  getNormalizedPointFromClient: (
    clientX: number,
    clientY: number,
  ) => { nx: number; ny: number } | null;
  syncMarkerOverlaysRef: React.RefObject<() => void>;
  updateSingleMarkerRef: React.RefObject<(id: string) => void>;
  viewerRef: React.RefObject<OpenSeadragon.Viewer | null>;
  overlayMapRef: React.RefObject<Map<string, HTMLElement>>;
}

export const useMapMarkers = ({
  viewerRef,
  classNames,
  drawMode = false,
  onMarkerSelect,
}: UseMapMarkersOptions): UseMapMarkersResult => {
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [markerAddMode, setMarkerAddMode] = useState(false);
  const overlayMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const syncMarkerOverlaysRef = useRef<() => void>(() => undefined);
  const updateSingleMarkerRef = useRef<(id: string) => void>(() => undefined);
  const createMarkerElementRef = useRef<(marker: MapMarker) => HTMLElement>(null!);
  const updateMarkerElementRef = useRef<
    (element: HTMLElement, marker: MapMarker, isActive: boolean) => void
  >(null!);
  const activeMarkerIdRef = useRef<string | null>(null);
  const mapMarkersRef = useRef<MapMarker[]>([]);

  const createMarkerId = () => {
    return `marker-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  };

  const updateMarker = useCallback((id: string, patch: Partial<MapMarker>) => {
    setMapMarkers(prev =>
      prev.map(marker =>
        marker.id === id
          ? {
              ...marker,
              ...patch,
              position: patch.position ?? marker.position,
            }
          : marker,
      ),
    );
  }, []);

  const deleteMarker = useCallback(
    (id: string) => {
      setMapMarkers(prev => prev.filter(marker => marker.id !== id));
      setActiveMarkerId(prev => (prev === id ? null : prev));
      onMarkerSelect?.(null);
    },
    [onMarkerSelect],
  );

  const addMarkerAt = useCallback(
    (nx: number, ny: number) => {
      const id = createMarkerId();
      const newMarker: MapMarker = {
        id,
        name: '新規マーカー',
        group: '',
        description: '',
        icon: DEFAULT_MARKER_ICON,
        color: DEFAULT_MARKER_COLOR,
        position: { nx, ny },
      };
      setMapMarkers(prev => [...prev, newMarker]);
      setActiveMarkerId(id);
      setMarkerAddMode(false);
      onMarkerSelect?.(id);
    },
    [onMarkerSelect],
  );

  const focusMarker = useCallback((marker: MapMarker) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const imageItem = viewer.world.getItemAt(0);
    if (!imageItem) return;
    const size = imageItem.getContentSize();
    if (!size.x || !size.y) return;
    const imagePoint = new OpenSeadragon.Point(
      marker.position.nx * size.x,
      marker.position.ny * size.y,
    );
    const viewportPoint = viewer.viewport.imageToViewportCoordinates(imagePoint);
    // 即時移動を使用してアニメーションのカクつきを回避
    viewer.viewport.panTo(viewportPoint, true);
    viewer.viewport.applyConstraints(true);
  }, []);

  const getNormalizedPointFromClient = useCallback((clientX: number, clientY: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return null;
    const imageItem = viewer.world.getItemAt(0);
    if (!imageItem) return null;
    const size = imageItem.getContentSize();
    if (!size.x || !size.y) return null;
    const rect = viewer.element.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const viewerPoint = new OpenSeadragon.Point(clientX - rect.left, clientY - rect.top);
    const imagePoint = viewer.viewport.viewerElementToImageCoordinates(viewerPoint);
    return {
      nx: _.clamp(imagePoint.x / size.x, 0, 1),
      ny: _.clamp(imagePoint.y / size.y, 0, 1),
    };
  }, []);

  const updateMarkerElement = useCallback(
    (element: HTMLElement, marker: MapMarker, isActive: boolean) => {
      // クラス名を構築: ベースクラス + アクティブ状態 + 描画モード
      const classNameParts = [classNames.mapMarker];
      if (isActive) {
        classNameParts.push(classNames.mapMarkerActive);
      }
      if (drawMode) {
        classNameParts.push(classNames.mapMarkerDrawMode);
      }
      element.className = classNameParts.join(' ');

      const iconElement = element.querySelector(
        `.${classNames.mapMarkerIcon}`,
      ) as HTMLDivElement | null;
      const iconNode = element.querySelector(
        `.${classNames.mapMarkerIconNode}`,
      ) as HTMLElement | null;
      const labelElement = element.querySelector(
        `.${classNames.mapMarkerLabel}`,
      ) as HTMLDivElement | null;

      if (iconElement) {
        const color = marker.color ?? DEFAULT_MARKER_COLOR;
        iconElement.style.color = color;
      }
      if (iconNode) {
        const iconKey = marker.icon ?? DEFAULT_MARKER_ICON;
        iconNode.className = `${classNames.mapMarkerIconNode} ${iconKey}`;
      }
      if (labelElement) {
        labelElement.textContent = marker.name || '無名のマーカー';
      }
    },
    [classNames, drawMode],
  );

  const createMarkerElement = useCallback(
    (marker: MapMarker) => {
      const element = document.createElement('div');
      element.className = classNames.mapMarker;
      element.dataset.markerId = marker.id;
      element.setAttribute('role', 'button');
      element.tabIndex = 0;

      const iconElement = document.createElement('div');
      iconElement.className = classNames.mapMarkerIcon;
      const iconNode = document.createElement('i');
      iconNode.className = classNames.mapMarkerIconNode;
      iconElement.appendChild(iconNode);

      const labelElement = document.createElement('div');
      labelElement.className = classNames.mapMarkerLabel;

      element.append(iconElement, labelElement);

      const handleSelect = () => {
        setActiveMarkerId(marker.id);
        onMarkerSelect?.(marker.id);
      };

      new OpenSeadragon.MouseTracker({
        element,
        pressHandler: event => {
          event.originalEvent.preventDefault();
          event.originalEvent.stopPropagation();
        },
        releaseHandler: event => {
          event.originalEvent.preventDefault();
          event.originalEvent.stopPropagation();
        },
        clickHandler: event => {
          event.originalEvent.preventDefault();
          event.originalEvent.stopPropagation();
          handleSelect();
        },
      });

      return element;
    },
    [classNames, onMarkerSelect],
  );

  // コールバックと状態の最新参照を保持し、syncMarkerOverlays の依存関係の頻繁な変化を回避
  useEffect(() => {
    createMarkerElementRef.current = createMarkerElement;
  }, [createMarkerElement]);

  useEffect(() => {
    updateMarkerElementRef.current = updateMarkerElement;
  }, [updateMarkerElement]);

  useEffect(() => {
    activeMarkerIdRef.current = activeMarkerId;
  }, [activeMarkerId]);

  useEffect(() => {
    mapMarkersRef.current = mapMarkers;
  }, [mapMarkers]);

  // ref で最新状態を取得し、useCallback の依存関係の変化を回避
  const syncMarkerOverlays = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const imageItem = viewer.world.getItemAt(0);
    if (!imageItem) return;
    const size = imageItem.getContentSize();
    if (!size.x || !size.y) return;
    const overlayMap = overlayMapRef.current;
    const markers = mapMarkersRef.current;
    const markerIds = new Set(markers.map(marker => marker.id));
    const currentActiveId = activeMarkerIdRef.current;

    // 削除済みマーカーを除去
    overlayMap.forEach((element, id) => {
      if (!markerIds.has(id)) {
        viewer.removeOverlay(element);
        overlayMap.delete(id);
      }
    });

    markers.forEach(marker => {
      const imagePoint = new OpenSeadragon.Point(
        marker.position.nx * size.x,
        marker.position.ny * size.y,
      );
      const viewportPoint = viewer.viewport.imageToViewportCoordinates(imagePoint);
      let element = overlayMap.get(marker.id);

      if (!element) {
        // 新規マーカーのみ作成して overlay に追加
        element = createMarkerElementRef.current(marker);
        overlayMap.set(marker.id, element);
        viewer.addOverlay({
          element,
          location: viewportPoint,
          placement: OpenSeadragon.Placement.CENTER,
        });
      } else {
        // 既存マーカーは位置のみ更新し、overlay の再追加はしない
        viewer.updateOverlay(element, viewportPoint, OpenSeadragon.Placement.CENTER);
      }
      // マーカー要素の内容を更新（名称、色、アクティブ状態等）
      updateMarkerElementRef.current(element, marker, marker.id === currentActiveId);
    });
  }, []);

  // 軽量更新: マーカーのアクティブ状態スタイルのみ更新し、overlay 全体は再同期しない
  const updateActiveState = useCallback(() => {
    const overlayMap = overlayMapRef.current;
    const currentActiveId = activeMarkerIdRef.current;
    const markers = mapMarkersRef.current;
    overlayMap.forEach((element, id) => {
      const marker = markers.find(marker => marker.id === id);
      if (marker) {
        updateMarkerElementRef.current(element, marker, id === currentActiveId);
      }
    });
  }, []);

  // 軽量更新: 単一マーカーの DOM 内容のみ更新し、overlay 全体の同期は行わない
  const updateSingleMarker = useCallback((id: string) => {
    const overlayMap = overlayMapRef.current;
    const element = overlayMap.get(id);
    if (!element) return;
    const markers = mapMarkersRef.current;
    const marker = markers.find(marker => marker.id === id);
    if (!marker) return;
    const currentActiveId = activeMarkerIdRef.current;
    updateMarkerElementRef.current(element, marker, id === currentActiveId);
  }, []);

  useEffect(() => {
    syncMarkerOverlaysRef.current = syncMarkerOverlays;
  }, [syncMarkerOverlays]);

  useEffect(() => {
    updateSingleMarkerRef.current = updateSingleMarker;
  }, [updateSingleMarker]);

  // activeMarkerId が変化したとき、overlay 全体を再同期せずアクティブ状態のみ更新
  useEffect(() => {
    updateActiveState();
  }, [activeMarkerId, updateActiveState]);

  // drawMode が変化したとき、全マーカーの描画モード状態を更新
  useEffect(() => {
    updateActiveState();
  }, [drawMode, updateActiveState]);

  return {
    markers: mapMarkers,
    setMarkers: setMapMarkers,
    activeMarkerId,
    setActiveMarkerId,
    markerAddMode,
    setMarkerAddMode,
    updateMarker,
    deleteMarker,
    addMarkerAt,
    focusMarker,
    getNormalizedPointFromClient,
    syncMarkerOverlaysRef,
    updateSingleMarkerRef,
    viewerRef,
    overlayMapRef,
  };
};
