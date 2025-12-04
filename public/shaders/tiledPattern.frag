uniform float u_time;
uniform vec3 u_color1; // Colore Sfondo (passa --color1)
uniform vec3 u_color2; // Colore Linee (passa --color2)
uniform vec2 u_speed;
uniform float u_aspect;
uniform float u_size;  // Imposta questo basso (es. 5.0 o 10.0) in Kaplay

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    // 1. Applica il movimento
    vec2 movement = u_speed * u_time;
    vec2 gridUV = uv + movement;
    
    // 2. Correggi l'aspect ratio per avere quadrati e non rettangoli
    gridUV.x *= u_aspect;
    
    // 3. Crea la griglia
    // Moltiplica per u_size per decidere quante celle avere
    vec2 gridPos = fract(gridUV * u_size);
    
    // 4. Disegna le linee (spessore della linea)
    // step(0.95, ...) disegna una linea solo nel 5% finale del quadrato
    float lines = step(0.95, gridPos.x) + step(0.95, gridPos.y);
    
    // Evita che le intersezioni siano troppo luminose (clamp)
    lines = clamp(lines, 0.0, 1.0);

    // 5. Colori
    vec3 bg = u_color1 / 255.0;     // Sfondo scuro
    vec3 lineCol = u_color2 / 255.0; // Linee neon

    // 6. Vignettatura (Opzionale: scurisce i bordi dello schermo per focus centrale)
    float vignette = length(uv - 0.5);
    vignette = smoothstep(0.8, 0.2, vignette); 

    // Mix finale: Sfondo + Linee, applicando la vignettatura
    vec3 finalColor = mix(bg, lineCol, lines * 0.3); // 0.3 riduce l'intensità delle linee per non disturbare

    return vec4(finalColor * vignette, 1.0);
}