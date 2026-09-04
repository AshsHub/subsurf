varying vec2 v_UV1;

uniform sampler2D u_Texture;
uniform float u_ScrollOffset;

void main() {
    vec2 uv = v_UV1;

    uv.y += u_ScrollOffset;

    gl_FragColor = texture2D(u_Texture, uv);
}