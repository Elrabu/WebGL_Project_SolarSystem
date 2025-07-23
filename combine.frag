#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomIntensity;

void main() {
    vec3 scene = texture(uScene, vUv).rgb;
    vec3 bloom = texture(uBloom, vUv).rgb;
    outColor = vec4(scene + bloom * uBloomIntensity, 1.0);
}