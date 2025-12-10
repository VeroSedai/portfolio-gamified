
export function getDirectionFromInput(k, isMouseDown, playerPos) {
    const direction = k.vec2(0, 0);

    // WASD / Arrow Keys
    if (k.isKeyDown("left") || k.isKeyDown("a")) direction.x = -1;
    if (k.isKeyDown("right") || k.isKeyDown("d")) direction.x = 1;
    if (k.isKeyDown("up") || k.isKeyDown("w")) direction.y = -1;
    if (k.isKeyDown("down") || k.isKeyDown("s")) direction.y = 1;

    // Mouse/Touch
    if (isMouseDown) {
        const worldMousePos = k.toWorld(k.mousePos());
        return worldMousePos.sub(playerPos).unit();
    }

    return direction;
}

export function updatePlayerAnimation(player, directionsMode) {
    if (player.direction.eq(player.k.vec2(0, 0))) {
        player.isIdle = true;
        const idleName = directionsMode === 8 ? `${player.directionName}-idle` : "idle";
        if (player.getCurAnim()?.name !== idleName) {
            try { player.play(idleName); } catch (e) { /* Silent fallback */ }
        }
        return;
    }

    player.isIdle = false;
    player.flipX = false;
    const { x, y } = player.direction;

    if (directionsMode === 8) {
        if (x > 0 && y > -0.5 && y < 0.5) player.directionName = "walk-right";
        else if (x < 0 && y > -0.5 && y < 0.5) player.directionName = "walk-left";
        else if (x < 0 && y < -0.8) player.directionName = "walk-up";
        else if (x < 0 && y > 0.8) player.directionName = "walk-down";
        else if (x < 0 && y > -0.8 && y < -0.5) player.directionName = "walk-left-up";
        else if (x < 0 && y > 0.5 && y < 0.8) player.directionName = "walk-left-down";
        else if (x > 0 && y < -0.5 && y > -0.8) player.directionName = "walk-right-up";
        else if (x > 0 && y > 0.5 && y < 0.8) player.directionName = "walk-right-down";
    } else {
        if (Math.abs(x) >= Math.abs(y)) {
            player.directionName = x > 0 ? "walk-right" : "walk-left";
        } else {
            player.directionName = y > 0 ? "walk-down" : "walk-up";
        }
    }

    if (player.getCurAnim()?.name !== player.directionName) {
        try {
            player.play(player.directionName);
        } catch (e) {
            if (player.directionName === "walk-left") {
                try {
                    player.play("walk-right");
                    player.flipX = true;
                } catch (ex) { }
            } else if (player.directionName === "walk-right" || player.directionName === "walk-left") {
                try {
                    player.play("walk-side");
                    if (player.directionName === "walk-left") player.flipX = true;
                } catch (ex) { }
            }
        }
    }
}
