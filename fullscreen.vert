#version 300 es
in vec2 a_position;
out vec2 vUv;

void main() {
    // transforms vertex positions into texture coordinates ranging from 0 to 1 (-1 to 1 before)
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}