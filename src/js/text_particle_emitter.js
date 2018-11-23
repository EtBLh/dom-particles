/*
*  Particle emitter. 
*  Configuration:
*    emitEvery: Milliseconds. How often to emit a particle.
*    position, velocity, acceleration: Vector-like objects. During update, velocity += acceleration, position += velocity.
*    rotation: Which direction this emitter is facing (IN DEGREES)
*    maxEmissions: Max number of particles to emit. Once reached, emitter stops.
*    ttl: Max number of milliseconds to emit particles for.
*    MAX_EMIT_PER_STEP: Maximum number of particles to emit per timestep. Limitation to stop all particles syncing up on browser tab switch. Not recommended to change.
*    particleOptions: See particle class. Options used to instantiate particles from this emitter.
*      If these options are getters, not literal, they will be recalculated per-particle (useful for randomization etc)
*      The initial position vector of a particle from an emitter is expressed _relative to the emitter_.
*      The initial velocity vector of a particle from an emitter is expressed _relative to the emitter's angle_.
*/

import { DEFAULT_PARTICLE_OPTIONS } from './text_particle';
import { propValueToFunction } from './utilities';

const zeroVector = { x: 0, y: 0 }

const DEFAULT_EMITTER_OPTIONS = {
  maxEmissions: false,
  ttl: false,
  emitEvery: 500,
  rotation: 0,
  particleOptions: { ...DEFAULT_PARTICLE_OPTIONS },
  onCreate: () => {},
  onUpdate: () => {},
  onDestroy: () => {},
  MAX_EMIT_PER_STEP: 16, /* Prevent thundering herds on tab switch */
}

export default class TextParticleEmitter {
  constructor (options) {
    Object.assign(this, {
      ...DEFAULT_EMITTER_OPTIONS, 
      ...options,
      position: { ...zeroVector, ...options.position },
      velocity: { ...zeroVector, ...options.velocity },
      acceleration: { ...zeroVector, ...options.acceleration },
    });
    
    this.manager = options.manager;
    this.totalElapsed = 0;
    this.elapsed = this.emitEvery;
    this.emitted = 0;
    this.frameNumber = 0;
    
    this.onCreate(this);
  }
  
  get alive () {
    if (this.maxEmissions && this.emitted >= this.maxEmissions) {
      return false;
    }
    if (this.ttl && this.totalElapsed >= this.ttl) {
      return false;
    }
    return true;
  }
  
  update (f) {
    // position update
    this.velocity.x += this.acceleration.x * f;
    this.velocity.y += this.acceleration.y * f;
    this.position.x += this.velocity.x * f;
    this.position.y += this.velocity.y * f;
    
    // emission update
    this.elapsed += f * 1000;
    this.totalElapsed += f * 1000;
    if (this.elapsed > this.emitEvery) {
      let toEmit = Math.floor(this.elapsed / this.emitEvery);
      toEmit = Math.min(toEmit, this.MAX_EMIT_PER_STEP);
      
      if (this.maxEmissions) { toEmit = Math.min(this.maxEmissions - this.emitted, toEmit); }
      this.elapsed = 0;
      
      for(let i = 0; i < toEmit; i++){
        let p = { ...zeroVector, ...this.particleOptions.position };
        let pp = { x: this.position.x + p.x, y: this.position.y + p.y }
        
        let v = { ...zeroVector, ...this.particleOptions.velocity };
        let v_angle = Math.atan2(v.y, v.x);
        let v_magna = Math.sqrt((v.x * v.x) + (v.y * v.y));
        let t_angle = (this.rotation / 180) * Math.PI;
        
        let vv = {
          x: v_magna * Math.cos(v_angle + t_angle),
          y: v_magna * Math.sin(v_angle + t_angle)
        }
        
        this.manager.addParticle({ ...this.particleOptions, position: pp, velocity: vv });
        // emit particle
        this.emitted ++;
      }
      
      this.frameNumber ++;
    }
    
    // user-provided update
    this.onUpdate(this);
  }
}