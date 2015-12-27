var
// Sprite vars //
        s_bg,
        s_bg2,
        s_fg,
        s_shuttle,
        s_shuttleX,
        s_shuttleO,
        s_text,
        s_text_delays,
        s_score,
        s_splash,
        s_junction,
        s_buttons,
        s_numberS,
        s_numberB,
        s_coin,
        s_star,
        s_gray_star;

/**
 * Simple sprite class
 *
 * @param {Image}  img    spritesheet image
 * @param {number} x      x-position in spritesheet
 * @param {number} y      y-position in spritesheet
 * @param {number} width  width of sprite
 * @param {number} height height of sprite
 */
function Sprite(img, x, y, width, height) {
    this.img = img;
    this.x = x * 2;
    this.y = y * 2;
    this.width = width * 2;
    this.height = height * 2;
}
;
/**
 * Draw sprite ta canvas context
 *
 * @param  {CanvasRenderingContext2D} ctx context used for drawing
 * @param  {number} x   x-position on canvas to draw from
 * @param  {number} y   y-position on canvas to draw from
 */
Sprite.prototype.draw = function (ctx, x, y) {
    //Math.min(this.width,600);
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height,
            x, y, this.width, this.height);
};

Sprite.prototype.drawX = function (ctx, x, y, x_offset, y_offset) {
    //Math.min(this.width,600);
    ctx.drawImage(this.img, this.x + x_offset, this.y + y_offset, 370, 600,
            x, y, 370, 600);
    //ctx.drawImage(this.img, x_offset, y_offset, x_offset+500, y_offset+500,
    //	x, y, x_offset+500, y_offset+500);
    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
};

/**
 * Initate all sprite
 *
 * @param  {Image} img spritesheet image
 */
function initSprites(img) {

    s_bg = new Sprite(img, 0, 36, 208, 114);
    s_bg2 = new Sprite(img, 0, 390, 208, 114);
    s_bg3 = new Sprite(img, 0, 520, 208, 114);
    s_bg4 = new Sprite(img, 0, 650, 208, 114);
    s_bg5 = new Sprite(img, 210, 650, 208, 114);
    s_bg6 = new Sprite(img, 410, 650, 208, 114);

    s_bg.color = "#70C5CF"; // #70C5CF save background color
    s_fg = new Sprite(img, 200, 50, 112, 56);

    s_shuttle = new Sprite(img, 181, 260, 80, 50);
    s_shuttleX = new Sprite(img, 171, 330, 90, 40);//170, 260, 200, 100);
    s_shuttleO = new Sprite(img, 186, 372, 90, 60);
    s_text_delays = new Sprite(img, 159, 241, 40, 14);

    s_coin = new Sprite(img, 276, 220, 33, 33);
    s_star= new Sprite(img, 0, 320, 8, 8);
    s_gray_star= new Sprite(img, 8, 320, 8, 8);

    s_text = {
        FlappyBird: new Sprite(img, 59, 164, 76, 20),
        GameOver: new Sprite(img, 59, 186, 94, 19),
        GetReady: new Sprite(img, 59, 205, 87, 22)
    }
    s_buttons = {
        Rate: new Sprite(img, 79, 227, 40, 14),
        Menu: new Sprite(img, 119, 227, 40, 14),
        Share: new Sprite(img, 159, 227, 40, 14),
        Score: new Sprite(img, 79, 241, 40, 14),
        Ok: new Sprite(img, 119, 241, 40, 14),
        Start: new Sprite(img, 159, 241, 40, 14),
        Shuttle: new Sprite(img, 0, 262, 75,45),//65, 40), // blank 
        Detour: new Sprite(img, 70, 262, 75,45),//65, 40), // blank
        Detour15: new Sprite(img, 712, 768, 65, 38),
        Detour15_trend: new Sprite(img, 840, 758, 65, 45),
        Shuttle_1star: new Sprite(img, 583, 768, 65, 38),
        Shuttle_2stars: new Sprite(img, 648, 728, 65, 38),
        Shuttle_3stars: new Sprite(img, 712, 728, 65, 38),
        Shuttle_4stars: new Sprite(img, 583, 728, 65, 38),
        Shuttle_5stars: new Sprite(img, 648, 768, 65, 38),
        Shuttle_low_positive_trend: new Sprite(img, 776, 758, 65, 45),
        Shuttle_high_neutral_trend: new Sprite(img, 903, 758, 65, 45),
        Shuttle_low_neutral_trend: new Sprite(img, 967, 758, 65, 45),
        Shuttle_high_negative_trend: new Sprite(img, 1030, 758, 65, 45),
        //Shuttle: new Sprite(img,  0, 305, 65, 55), // trends
        //Detour: new Sprite(img, 70, 305, 65, 55),  // trends
    }

    s_score = new Sprite(img, 138, 106, 113, 58);
    s_splash = new Sprite(img, 0, 164, 59, 53);
    s_junction = new Sprite(img, 420, 0, 1450, 1600); //650, 300, 300, 300);
    s_numberS = new Sprite(img, 0, 227, 6, 7);
    s_numberB = new Sprite(img, 0, 238, 7, 10);

    s_numberS.draw = s_numberB.draw = function (ctx, x, y, num, center, offset) {
        num = num.toString();

        var step = this.width + 2;

        if (center) {
            x = center - (num.length * step - 2) / 2;
        }
        if (offset) {
            x += step * (offset - num.length);
        }

        for (var i = 0, len = num.length; i < len; i++) {
            var n = parseInt(num[i]);
            ctx.drawImage(img, step * n, this.y, this.width, this.height,
                    x, y, this.width, this.height)
            x += step;
        }
    }
}
