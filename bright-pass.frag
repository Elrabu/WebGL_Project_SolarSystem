#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uScene;
uniform float uThreshold;

void main() {
    vec3 color = texture(uScene, vUv).rgb;
    float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > uThreshold) {
        outColor = vec4(color, 0.2);
    } else {
        outColor = vec4(0.0);
    }
}