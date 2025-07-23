#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform vec2 uDirection;

void main() {
    float weights[5] = float[](0.227, 0.194, 0.121, 0.054, 0.016);
    vec3 result = texture(uTexture, vUv).rgb * weights[0];

    for(int i = 1; i < 5; ++i) {
        vec2 offset = uDirection * float(i) * 1.0 / vec2(textureSize(uTexture, 0));
        result += texture(uTexture, vUv + offset).rgb * weights[i];
        result += texture(uTexture, vUv - offset).rgb * weights[i];
    }

    outColor = vec4(result, 1.0);
}