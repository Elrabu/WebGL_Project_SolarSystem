#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec3 v_normal;
in vec3 v_worldPos;
in vec2 v_uv;

uniform sampler2D u_texture;
uniform vec3 u_lightPos;

out vec4 outColor;

uniform int u_isSun;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_lightPos - v_worldPos);

    // Simple Lambertian diffuse shading
    float diffuse = max(dot(normal, lightDirection), 0.0);

	
	vec4 texColor = texture(u_texture, v_uv);
    if (u_isSun == 1) {
        outColor = texColor; // No shading
    } else {
        // Ambient + diffuse lighting
    float ambient = 0.1;
    vec3 finalColor = texColor.rgb * (ambient + diffuse);

    outColor = vec4(finalColor, texColor.a);
    }  
}
