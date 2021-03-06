import { DEFAULT_PARTICLE_OPTIONS } from "./text_particle";

const DEFAULT_EMITTER_OPTIONS = {
  maxEmissions: false,
  ttl: false,
  emitEvery: 500,
  heading: 0,
  particleOptions: { ...DEFAULT_PARTICLE_OPTIONS },
  onCreate: () => {},
  onUpdate: () => {},
  onDestroy: () => {},
  MAX_EMIT_PER_STEP: 16 /* Prevent thundering herds on tab switch */
};

export default class TextParticleEmitter {
  constructor(options) {
    options = options || {};

    Object.assign(this, {
      ...DEFAULT_EMITTER_OPTIONS,
      ...options,
      position: { ...{ x: 0, y: 0 }, ...options.position },
      velocity: { ...{ x: 0, y: 0 }, ...options.velocity },
      acceleration: { ...{ x: 0, y: 0 }, ...options.acceleration }
    });

    this.manager = options.manager;
    this.elapsed = 0;
    this.emitted = 0;
    this.frameNumber = 0;

    this.onCreate(this);
  }

  get alive() {
    if (this.maxEmissions && this.emitted >= this.maxEmissions) {
      return false;
    }
    if (this.ttl && this.totalElapsed >= this.ttl) {
      return false;
    }
    return true;
  }

  update(f) {
    // position update
    this.velocity.x += this.acceleration.x * f;
    this.velocity.y += this.acceleration.y * f;
    this.position.x += this.velocity.x * f;
    this.position.y += this.velocity.y * f;

    // emission update
    this.elapsed += 1000 * f;
    this.totalElapsed += 1000 * f;

    if (this.elapsed >= this.emitEvery) {
      let toEmit = Math.floor(this.elapsed / this.emitEvery);
      toEmit = Math.min(toEmit, this.MAX_EMIT_PER_STEP);

      if (this.maxEmissions) {
        toEmit = Math.min(this.maxEmissions - this.emitted, toEmit);
      }
      this.elapsed = 0;

      for (let i = 0; i < toEmit; i++) {
        let p = { ...{ x: 0, y: 0 }, ...this.particleOptions.position };
        let pp = { x: this.position.x + p.x, y: this.position.y + p.y };

        let v = { ...{ x: 0, y: 0 }, ...this.particleOptions.velocity };
        let v_angle = Math.atan2(v.y, v.x);
        let v_magna = Math.sqrt(v.x * v.x + v.y * v.y);

        let vv = {
          x: v_magna * Math.cos(v_angle + this.heading),
          y: v_magna * Math.sin(v_angle + this.heading)
        };

        this.manager.addParticle({
          ...this.particleOptions,
          position: pp,
          velocity: vv
        });
        // emit particle
        this.emitted += 1;
      }

      this.frameNumber += 1;
    }

    // user-provided update
    this.onUpdate(this, f);
  }
}
