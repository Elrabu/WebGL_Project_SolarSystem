#version 300 es

// attribute data
in vec3 a_position;
in vec2 a_uv;
in vec3 a_normal;

// varying data
out vec2 v_uv;
out vec3 v_localSpacePosition;
out vec3 v_worldSpaceNormal;
out vec3 v_worldSpacePosition;
out vec3 v_worldSpaceCameraPosition;

uniform mat4x4 u_modelMatrix;
uniform mat4x4 u_viewMatrix;
uniform mat4x4 u_projectionMatrix;

out vec3 v_normal;
out vec3 v_worldPos;

void main() {
    //transforms the vertex position a_position from model space to world space
	 vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);
     //extracts the transformed 3D world position and passes it to the fragment shader
    v_worldPos = worldPosition.xyz;
    //transforms the vertex normal vector a_normal from model space to world space
    v_normal = mat3(u_modelMatrix) * a_normal;
    //passes the texture coordinate attribute a_uv to the fragment shader
    v_uv = a_uv;

    gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;
}
