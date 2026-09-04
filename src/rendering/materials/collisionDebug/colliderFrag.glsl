varying vec3 v_Position;
varying vec3 v_Normal;

uniform vec3 u_Color;
uniform float u_Alpha;

void main() {
    vec3 position = v_Position;
    vec3 normal = abs(v_Normal);

    float edgeX;
    float edgeY;

    // X-facing face: use Y/Z for the edges.
    if (normal.x > 0.5) {
        edgeX = abs(abs(position.y) - 0.5);
        edgeY = abs(abs(position.z) - 0.5);
    }
    // Y-facing face: use X/Z for the edges.
    else if (normal.y > 0.5) {
        edgeX = abs(abs(position.x) - 0.5);
        edgeY = abs(abs(position.z) - 0.5);
    }
    // Z-facing face: use X/Y for the edges.
    else {
        edgeX = abs(abs(position.x) - 0.5);
        edgeY = abs(abs(position.y) - 0.5);
    }

    float edgeDistance = min(edgeX, edgeY);

    float edgeWidth = 0.02;

    if (edgeDistance > edgeWidth) {
        discard;
    }

    gl_FragColor = vec4(u_Color, u_Alpha);
}