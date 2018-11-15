// generalized lerping? (ugh, because then you're into other easing function stuff - at that point may as well be an anime.js plugin...
// an API like that would be cool, though. Any style attribute that's an array of values gets lerped over the course of the particle lifetime.

import { tryGetValue, easeArray, lerp, styleValueToFunction } from './utilities';

export const DEFAULT_PARTICLE_OPTIONS = {
  velocity: { x: 0, y: 0}, 
  acceleration: { x: 0, y: 0 },
  ttl: 1000,
  text: '.',
  style: {},
  onCreate: () => {},
  onUpdate: () => {},
  heading: 0,
  scale: { x: 1, y: 1 },
  grid: false
}

export default class TextParticle {
  constructor (options) {
    Object.assign(this, { ...DEFAULT_PARTICLE_OPTIONS, ...options});
    
    this.elapsed = 0;
    this.setText(this.text);
    this.buildStyle(this.style);
    this.updateTransform();
    this.el.style.opacity = 1;
    this.frameNumber = 0;
    this.onCreate(this);
    
    if (this.useGrid) {
      this.updateTransform = this.updateGridTransform;  
    }
  }
  
  get alive () {
    return this.elapsed < this.ttl;
  }
  
  get lifeFrac () {
    return this.elapsed / this.ttl;
  }
  
  buildStyle (styleObject) {
    let fixedStyles = {};
    let dynamicStyles = {};
    
    Object.keys(styleObject).map(styleKey => {
      let styleValue = styleObject[styleKey];
      if (typeof styleValue === 'string'){
        // fixed style, just assign it
        fixedStyles[styleKey] = styleValue; 
      
      } else if (Array.isArray(styleValue)) {
        // dynamic style, calculate function for it
        dynamicStyles[styleKey] = styleValueToFunction(styleValue);
      
      } else if (typeof styleValue === 'object') {
        // I guess...?           
      }
    });
    
    this.dynamicStyles = dynamicStyles;
    // assign fixed styles
    this.setStyle(fixedStyles);
  }
  
  setStyle(styleObject) {
    // Straightforward style assignment
    Object.assign(this.el.style, styleObject);  
  }
  
  setText (text) {
    this.el.innerText = text;
  }
  
  updateDynamicStyles () {
    let lifeFrac = this.lifeFrac;
    console.log(lifeFrac);
    let styleSnapshot = Object.keys(this.dynamicStyles)
      .reduce((a, b) => {
        let styleFn = this.dynamicStyles[b];
        return { ...a, [b]: styleFn(lifeFrac) }
      }, {});
    this.setStyle(styleSnapshot);
  }
  
  updateTransform () {
    this.el.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) rotateZ(${this.heading}rad) scale(${this.scale.x}, ${this.scale.y})`;
  }
  
  updateGridTransform () {
    let x = this.grid ? this.position.x - (this.position.x % this.grid) : this.position.x;
    let y = this.grid ? this.position.y - (this.position.y % this.grid) : this.position.y;
    this.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotateZ(${this.heading}rad) scale(${this.scale.x}, ${this.scale.y})`;
  }
    
  update (f) {
    this.elapsed += f * 1000;
    this.frameNumber ++;
    
    this.velocity.x += this.acceleration.x * f;
    this.velocity.y += this.acceleration.y * f;
    this.position.x += this.velocity.x * f;
    this.position.y += this.velocity.y * f;
    
    this.updateDynamicStyles();
    this.onUpdate(this);
    
    this.updateTransform();
  }
}