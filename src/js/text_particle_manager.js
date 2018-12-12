import TextParticle from './text_particle';
import TextParticleEmitter from './text_particle_emitter';

import { buildOffsets } from './utilities';

const DEFAULT_TPM_OPTIONS = {
  max: 100, 
  preallocate: 10, 
  tagName: 'span',
  autostart: true,
};

export default class TextParticleManager {
  constructor (options) {
    Object.assign(this, { ...DEFAULT_TPM_OPTIONS, ...options });
    
    this.container = this.container || document.querySelector('body');
    
    this._pool = [];
    this.particles = [];
    this.emitters = [];
    
    this.foldElement = document.createElement('div');
    this.foldElement.className = 'text-particle-manager-reservoir';
    this.foldElement.style.cssText = `position: absolute; width: 0; height: 0; top: 0; left: 0`;
    
    this.reservoirCSS = `position: absolute; display: none; pointer-events: none; white-space: pre-wrap; transform: translate3d(0px, 0px, 0px); box-sizing: border-box;`

    this.allocate(this.preallocate);
    this.container.appendChild(this.foldElement);
    
    this.frameStart = null;
  }
  
  addParticle (options) {
    if (this.particles.length < this.max) {
      
      let p = new TextParticle({...options, element: this.pop()});
      
      this.particles.push(p);

      if (!this.raf && this.autostart) {
        this.start();  
      }
      return p;
    }
  }
  
  addEmitter (options) {    
    let e = new TextParticleEmitter({...options, manager: this})
    this.emitters.push(e);
    if (!this.raf && this.autostart){
      this.start();
    }
    return e;
  }
  
  /* Problematic: Needs to duplicate element styles (font size etc) */
  from (element, pattern, options) {
    let offsets = buildOffsets(element.innerText, pattern);
    offsets.reverse().map(o => { 
      // should we just build our own whole element here and replace in the DOM in one go?
      // saves messing about with offsets...
      let r = document.createRange();
      r.setStart(element.childNodes[0], o[0]);
      r.setEnd(element.childNodes[0], o[1]);
      let s = document.createElement(this.tagName);
      r.surroundContents(s);      
      let { x, y, width, height } = s.getBoundingClientRect();
      Object.assign(s.style, { width, height });

      // let p = new TextParticle({...options, text: r.toString(), element: s, position: { x, y }, style: {...options.style, width, height }});
      // p.element.parentElement.removeChild(p.element);
      // this.foldElement.appendChild(p.element);
      // this.particles.push(p);
    });
    this.start();
  }
  
  start () {
    this.frameStart = performance.now();
    this.raf = requestAnimationFrame((t) => this.update(t));
  }
  
  reset () {
    if (this.raf) { cancelAnimationFrame(this.raf) }
    this.particles.map(p => {
      p.setContents('');
      p.setStyleText(this.reservoirCSS);
      
      this.push(p.element);
    });
    this.particles = [];
    
    this.emitters.map(e => e.onDestroy(e));
    this.emitters = [];
  }
  
  update(timestamp) {
    let dt = timestamp - this.frameStart;
    this.frameStart = timestamp;
    let f = (dt/1000);
    
    let particlesToDestroy = [];
    this.particles = this.particles.filter(p => {
      p.update(f);
      if (!p.alive) { particlesToDestroy.push(p) }
      return p.alive;
    });
    
    particlesToDestroy.map(p => {
      // reset styles and return to pool
      p.onDestroy(p);
      p.setContents('');
      p.setStyleText(this.reservoirCSS);
      
      this.push(p.element);
    });
    
    let emittersToDestroy = [];
    this.emitters = this.emitters.filter(e => {
      e.update(f);
      if (!e.alive) { emittersToDestroy.push(e); }
      return e.alive;
    });
    
    emittersToDestroy.map(e => e.onDestroy(e));

    if (this.emitters.length === 0 && this.particles.length === 0){
      cancelAnimationFrame(this.raf);
      this.raf = false;
    } else {
      requestAnimationFrame((t) => this.update(t));  
    }
  }
  
  push (el) {
    this._pool.push(el);
  }
    
  pop (el) {
    if (this._pool.length > 0){
      return this._pool.pop();
    } else {
      return this.create();
    }
  }
    
  create () {
    let element = document.createElement(this.tagName);
    element.style.cssText = this.reservoirCSS;
    this.foldElement.appendChild(element);    
    return element;
  }
  
  allocate (n) {
    if (this._pool.length < n){
      for(let i = this._pool.length; i < n; i++){
        this.push(this.create());
      }
    }
  }
    
}