/**
 * Ray-marching GLSL shaders for volume rendering.
 *
 * The volume is placed inside a unit cube [-0.5, 0.5]³.
 * The fragment shader marches a ray through the cube, sampling a
 * Data3DTexture and compositing front-to-back.
 *
 * Uniforms (controlled via VolumeRenderer):
 *   volumeTexture — the 3D voxel data (sampler3D, uint8 single channel)
 *   threshold     — voxels below this normalised value (0–1) are transparent
 *   opacityScale  — global opacity multiplier
 *   steps         — number of ray-march samples per pixel
 *
 * Colormap:
 *   Defined by the colormap() function below edit it directly to change
 *   Input t is a normalised density value in [0, 1]
 *   Default scheme: dark blue → cyan → white
 */

export const vertexShader = /* glsl */ `
varying vec3 vOrigin;
varying vec3 vDirection;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vOrigin    = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
  vDirection = position - vOrigin;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;
precision highp sampler3D;

uniform sampler3D volumeTexture;
uniform float threshold;
uniform float opacityScale;
uniform int   steps;

varying vec3 vOrigin;
varying vec3 vDirection;

// Edit this function to change the colormap.
// t is normalised density in [0, 1].
vec3 colormap(float t) {
  vec3 c = mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.8, 1.0), clamp(t * 2.0,       0.0, 1.0));
  c      = mix(c,                   vec3(1.0, 1.0, 1.0),  clamp(t * 2.0 - 1.0, 0.0, 1.0));
  return c;
}

// Intersect ray with axis-aligned box [-0.5, 0.5]^3
vec2 hitBox(vec3 orig, vec3 dir) {
  vec3 tMin = (-0.5 - orig) / dir;
  vec3 tMax = ( 0.5 - orig) / dir;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  return vec2(max(max(t1.x, t1.y), t1.z), min(min(t2.x, t2.y), t2.z));
}

void main() {
  vec3 rayDir = normalize(vDirection);
  vec2 bounds = hitBox(vOrigin, rayDir);

  if (bounds.x > bounds.y) discard;

  float tStart   = max(bounds.x, 0.0);
  float tEnd     = bounds.y;
  float stepSize = (tEnd - tStart) / float(steps);
  vec4  color    = vec4(0.0);

  for (int i = 0; i < steps; i++) {
    float t       = tStart + (float(i) + 0.5) * stepSize;
    vec3 texCoord = vOrigin + t * rayDir + 0.5;

    float density = texture(volumeTexture, texCoord).r;

    if (density > threshold) {
      float normalised = (density - threshold) / (1.0 - threshold + 1e-6);
      float alpha      = clamp(normalised * opacityScale * stepSize * 50.0, 0.0, 1.0);
      vec3  col        = colormap(normalised);

      color.rgb += (1.0 - color.a) * alpha * col;
      color.a   += (1.0 - color.a) * alpha;
    }

    if (color.a >= 0.95) break;
  }

  if (color.a < 0.01) discard;
  gl_FragColor = color;
}
`;
