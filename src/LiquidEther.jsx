import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./LiquidEther.css";

const defaultColors = ["#5227FF", "#FF9FFC", "#B497CF"];

export default function LiquidEther({
  mouseForce = 20, cursorSize = 100, isViscous = false, viscous = 30,
  iterationsViscous = 32, iterationsPoisson = 32, dt = 0.014, BFECC = true,
  resolution = 0.5, isBounce = false, colors = defaultColors,
  style = {}, className = "", autoDemo = true, autoSpeed = 0.5,
  autoIntensity = 2.2, takeoverDuration = 0.25, autoResumeDelay = 1000,
  autoRampDuration = 0.6
}) {
  const mountRef = useRef(null);
  const webglRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const rafRef = useRef(null);
  const intersectionObserverRef = useRef(null);
  const isVisibleRef = useRef(true);
  const resizeRafRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops) {
      let arr = Array.isArray(stops) && stops.length > 0
        ? stops.length === 1 ? [stops[0], stops[0]] : stops
        : ["#ffffff", "#ffffff"];
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i * 4 + 0] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

    const Common = {
      width: 0, height: 0, aspect: 1, pixelRatio: 1,
      time: 0, delta: 0,
      container: null, renderer: null, clock: null,
      init(container) {
        this.container = container;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x000000), 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        this.renderer.domElement.style.display = "block";
        this.clock = new THREE.Clock();
        this.clock.start();
      },
      resize() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        this.aspect = this.width / this.height;
        if (this.renderer) this.renderer.setSize(this.width, this.height, false);
      },
      update() {
        if (!this.clock) return;
        this.delta = this.clock.getDelta();
        this.time += this.delta;
      }
    };

    const Mouse = {
      coords: new THREE.Vector2(), coords_old: new THREE.Vector2(),
      diff: new THREE.Vector2(), timer: null,
      container: null, docTarget: null, listenerTarget: null,
      isHoverInside: false, hasUserControl: false, isAutoActive: false,
      autoIntensity: 2.0, onInteract: null,
      takeoverActive: false, takeoverStartTime: 0, takeoverDuration: 0.25,
      takeoverFrom: new THREE.Vector2(), takeoverTo: new THREE.Vector2(),
      init(container) {
        this.container = container;
        this.docTarget = container.ownerDocument || null;
        const dv = this.docTarget?.defaultView || window;
        if (!dv) return;
        this.listenerTarget = dv;
        const move = (e) => {
          if (!this.isPointInside(e.clientX, e.clientY)) { this.isHoverInside = false; return; }
          this.isHoverInside = true;
          if (this.onInteract) this.onInteract();
          if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
            const rect = this.container.getBoundingClientRect();
            this.takeoverFrom.copy(this.coords);
            this.takeoverTo.set(
              ((e.clientX - rect.left) / rect.width) * 2 - 1,
              -(((e.clientY - rect.top) / rect.height) * 2 - 1)
            );
            this.takeoverStartTime = performance.now();
            this.takeoverActive = true;
            this.hasUserControl = true;
            this.isAutoActive = false;
            return;
          }
          this.setCoords(e.clientX, e.clientY);
          this.hasUserControl = true;
        };
        this.listenerTarget.addEventListener("mousemove", move);
        this.listenerTarget.addEventListener("touchstart", (e) => {
          if (e.touches.length !== 1) return;
          const t = e.touches[0];
          if (!this.isPointInside(t.clientX, t.clientY)) return;
          if (this.onInteract) this.onInteract();
          this.setCoords(t.clientX, t.clientY);
          this.hasUserControl = true;
        }, { passive: true });
        this.listenerTarget.addEventListener("touchmove", (e) => {
          if (e.touches.length !== 1) return;
          const t = e.touches[0];
          if (!this.isPointInside(t.clientX, t.clientY)) return;
          if (this.onInteract) this.onInteract();
          this.setCoords(t.clientX, t.clientY);
        }, { passive: true });
        this._move = move;
        this._leave = () => { this.isHoverInside = false; };
        this.docTarget?.addEventListener("mouseleave", this._leave);
      },
      dispose() {
        if (this.listenerTarget) {
          this.listenerTarget.removeEventListener("mousemove", this._move);
        }
        if (this.docTarget) this.docTarget.removeEventListener("mouseleave", this._leave);
        this.listenerTarget = null;
        this.docTarget = null;
        this.container = null;
      },
      isPointInside(x, y) {
        if (!this.container) return false;
        const rect = this.container.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      },
      setCoords(x, y) {
        if (!this.container) return;
        if (this.timer) clearTimeout(this.timer);
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        this.coords.set(
          ((x - rect.left) / rect.width) * 2 - 1,
          -(((y - rect.top) / rect.height) * 2 - 1)
        );
        this.timer = setTimeout(() => { this.mouseMoved = false; }, 100);
      },
      setNormalized(nx, ny) { this.coords.set(nx, ny); this.mouseMoved = true; },
      update() {
        if (this.takeoverActive) {
          const t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
          if (t >= 1) {
            this.takeoverActive = false;
            this.coords.copy(this.takeoverTo);
            this.coords_old.copy(this.coords);
            this.diff.set(0, 0);
          } else {
            this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, t * t * (3 - 2 * t));
          }
        }
        this.diff.subVectors(this.coords, this.coords_old);
        this.coords_old.copy(this.coords);
        if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0);
        if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
      }
    };

    class AutoDriver {
      constructor(mouse, manager, opts) {
        this.mouse = mouse; this.manager = manager;
        this.enabled = opts.enabled; this.speed = opts.speed;
        this.resumeDelay = opts.resumeDelay || 3000;
        this.rampDurationMs = (opts.rampDuration || 0) * 1000;
        this.active = false;
        this.current = new THREE.Vector2(0, 0);
        this.target = new THREE.Vector2();
        this.lastTime = performance.now();
        this.activationTime = 0;
        this.margin = 0.2;
        this._tmpDir = new THREE.Vector2();
        this.pickNewTarget();
      }
      pickNewTarget() {
        this.target.set((Math.random() * 2 - 1) * (1 - this.margin), (Math.random() * 2 - 1) * (1 - this.margin));
      }
      forceStop() { this.active = false; this.mouse.isAutoActive = false; }
      update() {
        if (!this.enabled) return;
        const now = performance.now();
        if (now - this.manager.lastUserInteraction < this.resumeDelay) { if (this.active) this.forceStop(); return; }
        if (this.mouse.isHoverInside) { if (this.active) this.forceStop(); return; }
        if (!this.active) { this.active = true; this.current.copy(this.mouse.coords); this.lastTime = now; this.activationTime = now; }
        this.mouse.isAutoActive = true;
        let dtSec = Math.min((now - this.lastTime) / 1000, 0.016);
        this.lastTime = now;
        const dir = this._tmpDir.subVectors(this.target, this.current);
        if (dir.length() < 0.01) { this.pickNewTarget(); return; }
        dir.normalize();
        let ramp = 1;
        if (this.rampDurationMs > 0) { const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs); ramp = t * t * (3 - 2 * t); }
        this.current.addScaledVector(dir, Math.min(this.speed * dtSec * ramp, dir.length()));
        this.mouse.setNormalized(this.current.x, this.current.y);
      }
    }

    const FV = "attribute vec3 position;uniform vec2 px,boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 s=1.-boundarySpace*2.;pos.xy*=s;uv=.5+pos.xy*.5;gl_Position=vec4(pos,1.);}";
    const LV = "attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=.5+pos.xy*.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px;pos.xy*=n;gl_Position=vec4(pos,1.);}";
    const MV = "precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center,scale,px;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*scale*2.*px+center,0.,1.);}";
    const AF = "precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize,px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(!isBFECC){vec2 uv2=uv-texture2D(velocity,uv).xy*dt*ratio;gl_FragColor=vec4(texture2D(velocity,uv2).xy,0.,0.);}else{vec2 sn=uv,vo=texture2D(velocity,uv).xy,so=sn-vo*dt*ratio,vn1=texture2D(velocity,so).xy,sn2=so+vn1*dt*ratio,er=sn2-sn,sn3=sn-er*.5,v2=texture2D(velocity,sn3).xy,so2=sn3-v2*dt*ratio;gl_FragColor=vec4(texture2D(velocity,so2).xy,0.,0.);}}";
    const CF = "precision highp float;uniform sampler2D velocity,palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float l=clamp(length(vel),0.,1.);vec3 c=texture2D(palette,vec2(l,.5)).rgb;gl_FragColor=vec4(mix(bgColor.rgb,c,l),mix(bgColor.a,1.,l));}";
    const DF = "precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.)).x,x1=texture2D(velocity,uv+vec2(px.x,0.)).x,y0=texture2D(velocity,uv-vec2(0.,px.y)).y,y1=texture2D(velocity,uv+vec2(0.,px.y)).y;gl_FragColor=vec4((x1-x0+y1-y0)/(2.*dt));}";
    const EF = "precision highp float;uniform vec2 force,center,scale;varying vec2 vUv;void main(){vec2 c=(vUv-.5)*2.;float d=1.-min(length(c),1.);gl_FragColor=vec4(force*d*d,0.,1.);}";
    const PF = "precision highp float;uniform sampler2D pressure,divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.,0.)).r,p1=texture2D(pressure,uv-vec2(px.x*2.,0.)).r,p2=texture2D(pressure,uv+vec2(0.,px.y*2.)).r,p3=texture2D(pressure,uv-vec2(0.,px.y*2.)).r;gl_FragColor=vec4((p0+p1+p2+p3)/4.-texture2D(divergence,uv).r);}";
    const PRF = "precision highp float;uniform sampler2D pressure,velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float st=1.,p0=texture2D(pressure,uv+vec2(px.x*st,0.)).r,p1=texture2D(pressure,uv-vec2(px.x*st,0.)).r,p2=texture2D(pressure,uv+vec2(0.,px.y*st)).r,p3=texture2D(pressure,uv-vec2(0.,px.y*st)).r;vec2 v=texture2D(velocity,uv).xy;gl_FragColor=vec4(v-vec2(p0-p1,p2-p3)*.5*dt,0.,1.);}";
    const VF = "precision highp float;uniform sampler2D velocity,velocity_new;uniform float v,dt;uniform vec2 px;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy,n0=texture2D(velocity_new,uv+vec2(px.x*2.,0.)).xy,n1=texture2D(velocity_new,uv-vec2(px.x*2.,0.)).xy,n2=texture2D(velocity_new,uv+vec2(0.,px.y*2.)).xy,n3=texture2D(velocity_new,uv-vec2(0.,px.y*2.)).xy;gl_FragColor=vec4((4.*old+v*dt*(n0+n1+n2+n3))/(4.*(1.+v*dt)),0.,0.);}";

    const getFloatType = () => /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
    const fboOpts = () => ({ type: getFloatType(), depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping });

    function makePass(materialOverrides, output) {
      const s = new THREE.Scene();
      const cam = new THREE.Camera();
      const mat = new THREE.RawShaderMaterial(materialOverrides);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      s.add(mesh);
      return {
        scene: s, camera: cam, material: mat, mesh,
        render(tgt) {
          if (!Common.renderer) return;
          Common.renderer.setRenderTarget(tgt || null);
          Common.renderer.render(s, cam);
          Common.renderer.setRenderTarget(null);
        }
      };
    }

    const sims = {
      cellScale: new THREE.Vector2(), boundarySpace: new THREE.Vector2(),
      fbos: {}, passes: {},
      init(res) {
        const w = Math.max(4, Math.round(res * Common.width));
        const h = Math.max(4, Math.round(res * Common.height));
        this.cellScale.set(1 / w, 1 / h);
        const names = ["vel_0", "vel_1", "vel_v0", "vel_v1", "div", "pr_0", "pr_1"];
        const opts = fboOpts();
        names.forEach(n => this.fbos[n] = new THREE.WebGLRenderTarget(w, h, opts));
        const bp = { value: this.boundarySpace };
        const cs = { value: this.cellScale };
        this.passes.advect = makePass({
          vertexShader: FV, fragmentShader: AF,
          uniforms: { boundarySpace: bp, px: cs, fboSize: { value: new THREE.Vector2(w, h) }, velocity: { value: this.fbos.vel_0.texture }, dt: { value: 0.014 }, isBFECC: { value: true } }
        });
        this.passes.force = makePass({
          vertexShader: MV, fragmentShader: EF, blending: THREE.AdditiveBlending, depthWrite: false,
          uniforms: { px: cs, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2(100, 100) } }
        });
        this.passes.visc = makePass({
          vertexShader: FV, fragmentShader: VF,
          uniforms: { boundarySpace: bp, velocity: { value: this.fbos.vel_1.texture }, velocity_new: { value: this.fbos.vel_v0.texture }, v: { value: 30 }, px: cs, dt: { value: 0.014 } }
        });
        this.passes.div = makePass({
          vertexShader: FV, fragmentShader: DF,
          uniforms: { boundarySpace: bp, velocity: { value: this.fbos.vel_0.texture }, px: cs, dt: { value: 0.014 } }
        });
        this.passes.pois = makePass({
          vertexShader: FV, fragmentShader: PF,
          uniforms: { boundarySpace: bp, pressure: { value: this.fbos.pr_0.texture }, divergence: { value: this.fbos.div.texture }, px: cs }
        });
        this.passes.pres = makePass({
          vertexShader: FV, fragmentShader: PRF,
          uniforms: { boundarySpace: bp, pressure: { value: this.fbos.pr_0.texture }, velocity: { value: this.fbos.vel_0.texture }, px: cs, dt: { value: 0.014 } }
        });
        this.passes.line = makePass({
          vertexShader: LV, fragmentShader: AF,
          uniforms: { px: cs, fboSize: { value: new THREE.Vector2(w, h) }, velocity: { value: this.fbos.vel_0.texture }, dt: { value: 0.014 }, isBFECC: { value: true } }
        });
        this.passes.output = makePass({
          vertexShader: FV, fragmentShader: CF, transparent: true, depthWrite: false,
          uniforms: { velocity: { value: this.fbos.vel_0.texture }, boundarySpace: bp, palette: { value: paletteTex }, bgColor: { value: bgVec4 } }
        });
      },
      resize(res) { this.init(res); },
      step(opts) {
        const o = opts || {};
        if (o.isBounce) this.boundarySpace.set(0, 0); else this.boundarySpace.copy(this.cellScale);
        const dtv = o.dt || 0.014;
        this.passes.advect.material.uniforms.dt.value = dtv;
        this.passes.advect.render(this.fbos.vel_1);
        const csx = (o.cursorSize || 100);
        this.passes.force.material.uniforms.force.value.set((Mouse.diff.x / 2) * (o.mouseForce || 20), (Mouse.diff.y / 2) * (o.mouseForce || 20));
        this.passes.force.material.uniforms.center.value.set(
          Math.min(Math.max(Mouse.coords.x, -1 + csx * this.cellScale.x + this.cellScale.x * 2), 1 - csx * this.cellScale.x - this.cellScale.x * 2),
          Math.min(Math.max(Mouse.coords.y, -1 + csx * this.cellScale.y + this.cellScale.y * 2), 1 - csx * this.cellScale.y - this.cellScale.y * 2)
        );
        this.passes.force.material.uniforms.scale.value.set(csx, csx);
        this.passes.force.render(this.fbos.vel_1);
        let velFBO = this.fbos.vel_1;
        if (o.isViscous) {
          const viscU = this.passes.visc.material.uniforms;
          viscU.v.value = o.viscous || 30;
          viscU.velocity.value = this.fbos.vel_1.texture;
          let src = this.fbos.vel_v0, dst = this.fbos.vel_v1;
          for (let i = 0; i < (o.iterVisc || 32); i++) {
            viscU.velocity_new.value = src.texture;
            if (i % 2 === 0) { viscU.velocity_new.value = this.fbos.vel_v0.texture; this.passes.visc.render(this.fbos.vel_v1); }
            else { viscU.velocity_new.value = this.fbos.vel_v1.texture; this.passes.visc.render(this.fbos.vel_v0); }
          }
          velFBO = (o.iterVisc || 32) % 2 === 0 ? this.fbos.vel_v0 : this.fbos.vel_v1;
        }
        this.passes.div.material.uniforms.velocity.value = velFBO.texture;
        this.passes.div.render(this.fbos.div);
        let prSrc = this.fbos.pr_0, prDst = this.fbos.pr_1;
        for (let i = 0; i < (o.iterPois || 32); i++) {
          this.passes.pois.material.uniforms.pressure.value = (i % 2 === 0 ? this.fbos.pr_1 : this.fbos.pr_0).texture;
          this.passes.pois.render(i % 2 === 0 ? this.fbos.pr_0 : this.fbos.pr_1);
        }
        const prFinal = (o.iterPois || 32) % 2 === 0 ? this.fbos.pr_0 : this.fbos.pr_1;
        this.passes.pres.material.uniforms.velocity.value = velFBO.texture;
        this.passes.pres.material.uniforms.pressure.value = prFinal.texture;
        this.passes.pres.render(this.fbos.vel_0);
        this.passes.output.render(null);
      }
    };

    class WebGLManager {
      constructor(props) {
        this.props = props;
        this.running = false;
        this.lastUserInteraction = performance.now();
        Common.init(props.$wrapper);
        Mouse.init(props.$wrapper);
        Mouse.autoIntensity = props.autoIntensity;
        Mouse.takeoverDuration = props.takeoverDuration;
        Mouse.onInteract = () => { this.lastUserInteraction = performance.now(); if (this.autoDriver) this.autoDriver.forceStop(); };
        this.autoDriver = new AutoDriver(Mouse, this, { enabled: props.autoDemo, speed: props.autoSpeed, resumeDelay: props.autoResumeDelay, rampDuration: props.autoRampDuration });
        sims.init(resolution);
        this.props.$wrapper.prepend(Common.renderer.domElement);
        window.addEventListener("resize", this._resize = () => { Common.resize(); sims.resize(resolution); });
        document.addEventListener("visibilitychange", this._onVis = () => { document.hidden ? this.pause() : (isVisibleRef.current && this.start()); });
      }
      loop() { if (!this.running) return; this.autoDriver?.update(); Mouse.update(); Common.update(); sims.step({ mouseForce, cursorSize, isViscous, viscous, iterVisc: iterationsViscous, iterPois: iterationsPoisson, dt, BFECC, isBounce, resolution }); rafRef.current = requestAnimationFrame(() => this.loop()); }
      start() { if (this.running) return; this.running = true; this.loop(); }
      pause() { this.running = false; if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } }
      dispose() {
        try { window.removeEventListener("resize", this._resize); if (this._onVis) document.removeEventListener("visibilitychange", this._onVis); Mouse.dispose(); if (Common.renderer) { const c = Common.renderer.domElement; c?.parentNode?.removeChild(c); Common.renderer.dispose(); Common.renderer.forceContextLoss(); } } catch {}
      }
    }

    const ctr = mountRef.current;
    ctr.style.position = ctr.style.position || "relative";
    ctr.style.overflow = ctr.style.overflow || "hidden";
    const webgl = new WebGLManager({ $wrapper: ctr, autoDemo, autoSpeed, autoIntensity, takeoverDuration, autoResumeDelay, autoRampDuration });
    webglRef.current = webgl;
    webgl.start();

    const io = new IntersectionObserver(([entry]) => {
      const vis = entry.isIntersecting && entry.intersectionRatio > 0;
      isVisibleRef.current = vis;
      webglRef.current?.[vis && !document.hidden ? "start" : "pause"]();
    }, { threshold: [0, 0.01, 0.1] });
    io.observe(ctr);
    intersectionObserverRef.current = io;

    const ro = new ResizeObserver(() => { resizeRafRef.current = requestAnimationFrame(() => { Common.resize(); sims.resize(resolution); }); });
    ro.observe(ctr);
    resizeObserverRef.current = ro;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { resizeObserverRef.current?.disconnect(); } catch {}
      try { intersectionObserverRef.current?.disconnect(); } catch {}
      webglRef.current?.dispose();
      webglRef.current = null;
    };
  }, []);

  return <div ref={mountRef} className={`liquid-ether-container ${className || ""}`.trim()} style={style} />;
}
