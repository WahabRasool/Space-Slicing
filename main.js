let program;
function setup() {
   pixelDensity(1);
   smooth();
   createCanvas(windowWidth, windowHeight,WEBGL);
  program = createShader(vert,frag);
}

function draw() {
  const margin = 32;
  const side = min(width, height) - margin * 2;
  background(0);
  fill(255);
  shader(program);
  const loopLen = 360;
  program.setUniform("mouseY", (mouseY - (height - side) * 0.5) / side);
  
  program.setUniform("time", frameCount / 30);
  program.setUniform("rect", [(width - side) / 2, (height - side) / 2, side, side]);
  rect(-side * 0.5, -side* 0.5, side, side);
  resetShader();
}

const vert=`#version 300 es
precision highp float;
precision highp int;

in vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`;

const frag=`#version 300 es
precision highp float;

uniform float mouseY;
uniform float time;
uniform vec4 rect;
out vec4 fragColor;

#define PI 3.14159265358979323846

mat2 inv(mat2 m) {
	float a = m[0][0];
	float b = m[1][0];
	float c = m[0][1];
	float d = m[1][1];
	float det = (a * d - b * c);
	if (det != 0.0) {
		return mat2(d, -b, -c, a) / det ;
	} else {
		return mat2(0.0, 0.0, 0.0, 0.0);
	}
}

vec3 sphereColor(vec3 p) {
  p -= vec3(0.5);
  float d = length(p);
  float l = smoothstep(0.5, 0.51, d);
  
  
  vec3 ca = mix(vec3(255.0, 20.0, 0.0) / 255.0, vec3(30.0, 120.0, 0.0) / 255.0, smoothstep(-1.0, 1.0, p.y));
  
  vec3 cb = mix(vec3(4.0, 80.0, 120.0) / 255.0, vec3(255.0, 208.0, 10.0) / 255.0, smoothstep(-1.0, 1.0, p.z));
  
  return mix(ca, cb, l);
}

void main(void)
{
  vec2 crd = ((gl_FragCoord.xy - rect.xy) / rect.zw - vec2(0.5)) * 2.0;
	float px = 1.0 / max(rect.z, rect.w);
	float sqrt3 = sqrt(3.0);
	
	float yTh = clamp((1.0 - mouseY) * 2.0, 0.0, 1.0);
  yTh = sin(time * PI / 24.0) * 0.5 + 0.5;
  float mlt = 0.9;
	float x = 0.0, y = 0.0, z = 0.0, b = 0.0;
	if (crd.x < 0.0) {
		vec2 lCrd = crd - vec2(-sqrt3 * 0.5, -0.5);
		mat2 mat = inv(mat2(sqrt3, 0.0, -1.0, 2.0) * 0.5);
		lCrd = mat * lCrd;
		x = lCrd.x;
		y = lCrd.y;
	} else {
		vec2 lCrd = crd - vec2(0.0, -1.0);
		mat2 mat = inv(mat2(sqrt3, 0.0, 1.0, 2.0) * 0.5);
		lCrd = mat * lCrd;
		x = 1.0;
		z = lCrd.x;
		y = lCrd.y;
	}
	if (y > yTh) {
		vec2 lCrd = crd - vec2(-sqrt3 * 0.5, -0.5 + yTh);
		mat2 mat = inv(mat2(sqrt3, sqrt3, -1.0, 1.0) * 0.5);
		lCrd = mat * lCrd;
		x = lCrd.x;
		y = yTh;
		z = lCrd.y;
    mlt = 1.0;
	}
	
  vec3 p = vec3(x, y, z);
	vec4 color = vec4(vec3(sphereColor(p)) * mlt, 1.0);
	
	float mx = max(x, max(y, z));
	float mn = min(x, min(y, z));
	color.rgb = mix(color.rgb, vec3(0.0), smoothstep(0.0, px, -mn));
	color.rgb = mix(color.rgb, vec3(0.0), smoothstep(0.0, px, mx - 1.0));
	
  color.rgb = pow(color.rgb, vec3(1.0 / 2.2));
  fragColor=color;
}`;


