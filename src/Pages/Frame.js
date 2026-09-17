import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Line } from "react-konva";
import { Helmet } from "react-helmet";

import { tamilDesignDataUrl } from "../assets/frame/tamilDesign";
import "./Frame.css";

// aspect preset value = width / height
const ASPECTS = {
  "4:5": 4 / 5,
  "1:1": 1,
  "9:16": 9 / 16,
};

// natural ratio (w/h) of the design artwork — keeps it undistorted while scaling
const DESIGN_RATIO = 520 / 200;

const MAX_STAGE_WIDTH = 460;

// Load an HTMLImageElement from any src (data URL / object URL). Returns the
// element once it has decoded, or null while loading.
function useHtmlImage(src) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (!src) {
      setImage(null);
      return undefined;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    let cancelled = false;
    img.onload = () => {
      if (!cancelled) setImage(img);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return image;
}

export default function Frame() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const fileInputRef = useRef(null);

  const [photoSrc, setPhotoSrc] = useState(null);
  const [aspectKey, setAspectKey] = useState("4:5");
  const [designColor, setDesignColor] = useState("#ffffff");
  const [selected, setSelected] = useState(false);
  const [stage, setStage] = useState({ width: 360, height: 450 });
  const [guides, setGuides] = useState({ v: false, h: false });
  const [busy, setBusy] = useState(false);

  // Design placement stored as fractions of the stage so it stays correct
  // across resizes and aspect changes. cx/cy = center, w = width fraction.
  const [norm, setNorm] = useState({ cx: 0.5, cy: 0.72, w: 0.6, rotation: 0 });

  const photo = useHtmlImage(photoSrc);
  const designUrl = useMemo(() => tamilDesignDataUrl(designColor), [designColor]);
  const design = useHtmlImage(designUrl);

  // Keep the stage sized to its container (responsive, capped for desktop).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const apply = () => {
      const avail = el.clientWidth;
      const width = Math.max(240, Math.min(avail, MAX_STAGE_WIDTH));
      const height = width / ASPECTS[aspectKey];
      setStage({ width, height });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspectKey]);

  // Bind/unbind the transformer to the design when selection changes. Both the
  // Transformer and the design are always mounted, and we locate the design via
  // the stable stage ref by name — this avoids any ref mount-timing race.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    if (!selected) {
      tr.nodes([]);
    } else {
      const stageNode = stageRef.current;
      const node = stageNode ? stageNode.findOne(".design-node") : null;
      if (node) tr.nodes([node]);
    }
    const layer = tr.getLayer();
    if (layer) layer.batchDraw();
  }, [selected, design, stage, photo]);

  // Derived pixel geometry for the design from the normalized state.
  const designPx = useMemo(() => {
    const w = norm.w * stage.width;
    const h = w / DESIGN_RATIO;
    return {
      width: w,
      height: h,
      x: norm.cx * stage.width,
      y: norm.cy * stage.height,
      offsetX: w / 2,
      offsetY: h / 2,
      rotation: norm.rotation,
    };
  }, [norm, stage]);

  // Photo geometry: "cover" the whole stage, centered (photo is fixed).
  const photoPx = useMemo(() => {
    if (!photo) return null;
    const scale = Math.max(stage.width / photo.width, stage.height / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    return { x: (stage.width - w) / 2, y: (stage.height - h) / 2, width: w, height: h };
  }, [photo, stage]);

  const onPickFile = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoSrc(reader.result);
      setNorm({ cx: 0.5, cy: 0.72, w: 0.6, rotation: 0 });
      setSelected(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-picking the same file
  }, []);

  const onDragMove = useCallback((e) => {
    const node = e.target;
    if (!node) return;
    const snap = 8;
    let x = node.x();
    let y = node.y();
    const v = Math.abs(x - stage.width / 2) < snap;
    const h = Math.abs(y - stage.height / 2) < snap;
    if (v) x = stage.width / 2;
    if (h) y = stage.height / 2;
    node.x(x);
    node.y(y);
    setGuides({ v, h });
  }, [stage]);

  const commitFromNode = useCallback((e) => {
    const node = e.target;
    if (!node) return;
    setNorm({
      cx: node.x() / stage.width,
      cy: node.y() / stage.height,
      w: (node.width() * node.scaleX()) / stage.width,
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
    setGuides({ v: false, h: false });
  }, [stage]);

  // Select the design and bind the transformer immediately using the event's
  // own node — no reliance on ref/stage timing.
  const selectDesign = useCallback((e) => {
    setSelected(true);
    const tr = trRef.current;
    if (tr && e && e.target) {
      tr.nodes([e.target]);
      const layer = tr.getLayer();
      if (layer) layer.batchDraw();
    }
  }, []);

  const resetDesign = useCallback(() => {
    setNorm({ cx: 0.5, cy: 0.72, w: 0.6, rotation: 0 });
  }, []);

  const exportUri = useCallback(
    () => stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" }),
    []
  );

  const download = useCallback(() => {
    if (!photo) return;
    setSelected(false);
    setBusy(true);
    // wait a frame for the transformer handles to unmount before capturing
    setTimeout(() => {
      const uri = exportUri();
      const a = document.createElement("a");
      a.download = "tamil-frame.png";
      a.href = uri;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setBusy(false);
    }, 60);
  }, [photo, exportUri]);

  const share = useCallback(() => {
    if (!photo) return;
    setSelected(false);
    setBusy(true);
    setTimeout(async () => {
      try {
        const uri = exportUri();
        const blob = await (await fetch(uri)).blob();
        const file = new File([blob], "tamil-frame.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "தமிழ் மன்றம்" });
        } else {
          download();
        }
      } catch (err) {
        // user cancelled or unsupported — no-op
      } finally {
        setBusy(false);
      }
    }, 60);
  }, [photo, exportUri, download]);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="frame-page">
      <Helmet>
        <title>Frame your photo · தமிழ் மன்றம்</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் மன்றம்</span>
        <span className="frame-subtitle">Frame your photo</span>
      </header>

      <div className="frame-stage-wrap" ref={containerRef}>
        <div className="frame-stage-shadow" style={{ width: stage.width, height: stage.height }}>
          {!photo && (
            <button
              type="button"
              className="frame-dropzone"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <span className="frame-dropzone-icon">＋</span>
              <span className="frame-dropzone-title">Add your photo</span>
              <span className="frame-dropzone-hint">Tap to choose from camera or gallery</span>
            </button>
          )}

          {photo && (
            <Stage
              ref={stageRef}
              width={stage.width}
              height={stage.height}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) setSelected(false);
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) setSelected(false);
              }}
            >
              <Layer listening={false}>
                {photoPx && <KonvaImage image={photo} {...photoPx} />}
              </Layer>

              <Layer>
                {design && (
                  <KonvaImage
                    name="design-node"
                    image={design}
                    x={designPx.x}
                    y={designPx.y}
                    width={designPx.width}
                    height={designPx.height}
                    offsetX={designPx.offsetX}
                    offsetY={designPx.offsetY}
                    rotation={designPx.rotation}
                    shadowColor="#000000"
                    shadowBlur={8}
                    shadowOpacity={0.45}
                    shadowOffset={{ x: 0, y: 2 }}
                    draggable
                    onClick={selectDesign}
                    onTap={selectDesign}
                    onDragStart={selectDesign}
                    onDragMove={onDragMove}
                    onDragEnd={commitFromNode}
                    onTransformEnd={commitFromNode}
                  />
                )}

                <Transformer
                  ref={trRef}
                  visible={selected}
                  rotationSnaps={[0, 90, 180, 270]}
                  keepRatio
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  anchorStroke="#e6b422"
                  anchorFill="#ffffff"
                  anchorSize={12}
                  borderStroke="#e6b422"
                  borderDash={[4, 4]}
                  boundBoxFunc={(oldBox, newBox) =>
                    newBox.width < 40 ? oldBox : newBox
                  }
                />

                {guides.v && (
                  <Line
                    points={[stage.width / 2, 0, stage.width / 2, stage.height]}
                    stroke="#e6b422"
                    strokeWidth={1}
                    dash={[6, 6]}
                    listening={false}
                  />
                )}
                {guides.h && (
                  <Line
                    points={[0, stage.height / 2, stage.width, stage.height / 2]}
                    stroke="#e6b422"
                    strokeWidth={1}
                    dash={[6, 6]}
                    listening={false}
                  />
                )}
              </Layer>
            </Stage>
          )}
        </div>
      </div>

      {photo && <p className="frame-tip">Drag the text · pinch or drag a corner to resize · twist to rotate</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPickFile}
      />

      <div className="frame-controls">
        <div className="frame-seg" role="group" aria-label="Aspect ratio">
          {Object.keys(ASPECTS).map((k) => (
            <button
              key={k}
              type="button"
              className={`frame-seg-btn ${aspectKey === k ? "is-active" : ""}`}
              onClick={() => setAspectKey(k)}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="frame-seg" role="group" aria-label="Design colour">
          <button
            type="button"
            className={`frame-seg-btn ${designColor === "#ffffff" ? "is-active" : ""}`}
            onClick={() => setDesignColor("#ffffff")}
          >
            Light
          </button>
          <button
            type="button"
            className={`frame-seg-btn ${designColor === "#111111" ? "is-active" : ""}`}
            onClick={() => setDesignColor("#111111")}
          >
            Dark
          </button>
        </div>
      </div>

      <div className="frame-actions">
        <button
          type="button"
          className="frame-btn frame-btn-ghost"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          {photo ? "Change photo" : "Add photo"}
        </button>
        <button
          type="button"
          className="frame-btn frame-btn-ghost"
          onClick={resetDesign}
          disabled={!photo}
        >
          Reset text
        </button>
        {canShare ? (
          <button
            type="button"
            className="frame-btn frame-btn-primary"
            onClick={share}
            disabled={!photo || busy}
          >
            {busy ? "Preparing…" : "Share"}
          </button>
        ) : (
          <button
            type="button"
            className="frame-btn frame-btn-primary"
            onClick={download}
            disabled={!photo || busy}
          >
            {busy ? "Preparing…" : "Download"}
          </button>
        )}
      </div>

      {canShare && (
        <button
          type="button"
          className="frame-btn frame-btn-text"
          onClick={download}
          disabled={!photo || busy}
        >
          or download instead
        </button>
      )}
    </div>
  );
}
