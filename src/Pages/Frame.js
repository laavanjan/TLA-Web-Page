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

import { DESIGNS } from "../assets/frame/designs";
import LotusDivider from "./LotusDivider";
import "./Frame.css";

// aspect preset value = width / height
const ASPECTS = {
  "4:5": 4 / 5,
  "1:1": 1,
  "9:16": 9 / 16,
};

const MAX_STAGE_WIDTH = 540;

// photo zoom range (1 = "cover" the frame exactly)
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

// design size = its width as a fraction of the stage width
const DESIGN_MIN_W = 0.25;
const DESIGN_MAX_W = 1.6;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
  const [designId, setDesignId] = useState(DESIGNS[0].id);
  const [selected, setSelected] = useState(false);
  const [stage, setStage] = useState({ width: 360, height: 450 });
  const [guides, setGuides] = useState({ v: false, h: false });
  const [busy, setBusy] = useState(false);

  // Photo transform within the frame: zoom (>= cover) and pan stored as
  // fractions of the pannable overflow (0.5 = centred) so it stays valid
  // across resizes and aspect changes.
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoPan, setPhotoPan] = useState({ fx: 0.5, fy: 0.5 });

  // Design placement stored as fractions of the stage so it stays correct
  // across resizes and aspect changes. cx/cy = center, w = width fraction.
  const [norm, setNorm] = useState({ cx: 0.5, cy: 0.72, w: 0.6, rotation: 0 });

  const currentDesign = useMemo(
    () => DESIGNS.find((d) => d.id === designId) || DESIGNS[0],
    [designId]
  );
  const photo = useHtmlImage(photoSrc);
  const design = useHtmlImage(currentDesign.src);

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

  // Pinch-to-zoom the photo on touch devices (two-finger). Pan fractions are
  // preserved, so zooming keeps the same region roughly centred.
  useEffect(() => {
    const stageNode = stageRef.current;
    const el = stageNode && stageNode.container();
    if (!el) return undefined;
    let lastDist = 0;
    const distOf = (t) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onMove = (ev) => {
      if (ev.touches && ev.touches.length === 2) {
        ev.preventDefault();
        const d = distOf(ev.touches);
        if (lastDist > 0) {
          const ratio = d / lastDist;
          setPhotoZoom((z) => clamp(+(z * ratio).toFixed(3), MIN_ZOOM, MAX_ZOOM));
        }
        lastDist = d;
      }
    };
    const onEnd = (ev) => {
      if (!ev.touches || ev.touches.length < 2) lastDist = 0;
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [photo, stage]);

  // Derived pixel geometry for the design from the normalized state.
  const designPx = useMemo(() => {
    const w = norm.w * stage.width;
    const h = w / currentDesign.ratio;
    return {
      width: w,
      height: h,
      x: norm.cx * stage.width,
      y: norm.cy * stage.height,
      offsetX: w / 2,
      offsetY: h / 2,
      rotation: norm.rotation,
    };
  }, [norm, stage, currentDesign]);

  // Photo geometry: scaled to at least "cover" the frame, then panned. The
  // photo is draggable but clamped so it always fills the frame (no gaps).
  const photoView = useMemo(() => {
    if (!photo) return null;
    const cover = Math.max(stage.width / photo.width, stage.height / photo.height);
    const scale = cover * photoZoom;
    const w = photo.width * scale;
    const h = photo.height * scale;
    const overflowX = Math.max(0, w - stage.width);
    const overflowY = Math.max(0, h - stage.height);
    return {
      width: w,
      height: h,
      overflowX,
      overflowY,
      x: -overflowX * photoPan.fx,
      y: -overflowY * photoPan.fy,
      draggable: overflowX > 0.5 || overflowY > 0.5,
    };
  }, [photo, stage, photoZoom, photoPan]);

  const commitPhotoPan = useCallback(
    (e) => {
      if (!photo) return;
      const node = e.target;
      const cover = Math.max(stage.width / photo.width, stage.height / photo.height);
      const scale = cover * photoZoom;
      const overflowX = Math.max(0, photo.width * scale - stage.width);
      const overflowY = Math.max(0, photo.height * scale - stage.height);
      setPhotoPan({
        fx: overflowX > 0 ? clamp(-node.x() / overflowX, 0, 1) : 0.5,
        fy: overflowY > 0 ? clamp(-node.y() / overflowY, 0, 1) : 0.5,
      });
    },
    [photo, stage, photoZoom]
  );

  const resetPhoto = useCallback(() => {
    setPhotoZoom(1);
    setPhotoPan({ fx: 0.5, fy: 0.5 });
  }, []);

  const onPickFile = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoSrc(reader.result);
      setPhotoZoom(1);
      setPhotoPan({ fx: 0.5, fy: 0.5 });
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

  // Scale the design from its width fraction (keeps its centre and rotation).
  const setDesignSize = useCallback((val) => {
    setNorm((n) => ({ ...n, w: clamp(val, DESIGN_MIN_W, DESIGN_MAX_W) }));
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
          await navigator.share({ files: [file], title: "தமிழ் இலக்கிய மன்றம்" });
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
        <title>Frame your photo · தமிழ் இலக்கிய மன்றம்</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Frame your photo</span>
      </header>

      <div className="frame-layout">
        <div className="frame-main">
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
              onWheel={(e) => {
                e.evt.preventDefault();
                const factor = e.evt.deltaY > 0 ? 0.94 : 1.06;
                setPhotoZoom((z) => clamp(+(z * factor).toFixed(3), MIN_ZOOM, MAX_ZOOM));
              }}
            >
              <Layer>
                {photoView && (
                  <KonvaImage
                    image={photo}
                    x={photoView.x}
                    y={photoView.y}
                    width={photoView.width}
                    height={photoView.height}
                    draggable={photoView.draggable}
                    dragBoundFunc={(pos) => ({
                      x: clamp(pos.x, -photoView.overflowX, 0),
                      y: clamp(pos.y, -photoView.overflowY, 0),
                    })}
                    onDragMove={commitPhotoPan}
                    onDragEnd={commitPhotoPan}
                    onMouseDown={() => setSelected(false)}
                    onTouchStart={() => setSelected(false)}
                  />
                )}
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

      {photo && (
        <p className="frame-tip">
          Drag the photo to reposition · drag the text to move, resize or rotate it
        </p>
      )}
        </div>{/* frame-main */}

        <div className="frame-panel">

      {photo && (
        <div className="frame-zoom">
          <span className="frame-zoom-label">Zoom</span>
          <input
            type="range"
            className="frame-range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step="0.01"
            value={photoZoom}
            aria-label="Photo zoom"
            style={{
              backgroundSize: `${
                ((photoZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
              }% 100%`,
            }}
            onChange={(e) =>
              setPhotoZoom(clamp(parseFloat(e.target.value), MIN_ZOOM, MAX_ZOOM))
            }
          />
          <button
            type="button"
            className="frame-zoom-reset"
            onClick={resetPhoto}
            title="Reset photo position and zoom"
            aria-label="Reset photo"
          >
            ⟳
          </button>
        </div>
      )}

      {photo && selected && (
        <div className="frame-zoom">
          <span className="frame-zoom-label">Size</span>
          <input
            type="range"
            className="frame-range"
            min={DESIGN_MIN_W}
            max={DESIGN_MAX_W}
            step="0.01"
            value={norm.w}
            aria-label="Design size"
            style={{
              backgroundSize: `${
                ((norm.w - DESIGN_MIN_W) / (DESIGN_MAX_W - DESIGN_MIN_W)) * 100
              }% 100%`,
            }}
            onChange={(e) => setDesignSize(parseFloat(e.target.value))}
          />
          <button
            type="button"
            className="frame-zoom-reset"
            onClick={resetDesign}
            title="Reset design size and position"
            aria-label="Reset design"
          >
            ⟳
          </button>
        </div>
      )}

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
      </div>

      <div className="frame-designs" role="group" aria-label="Choose a design">
        {DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            title={d.label}
            aria-label={d.label}
            aria-pressed={designId === d.id}
            className={`frame-design-tile ${designId === d.id ? "is-active" : ""}`}
            onClick={() => setDesignId(d.id)}
          >
            <img src={d.src} alt={d.label} draggable={false} />
          </button>
        ))}
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
        </div>{/* frame-panel */}
      </div>{/* frame-layout */}
    </div>
  );
}
