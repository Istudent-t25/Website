import sharp from "sharp";
await sharp("desktop-1280x720.png").resize(1280, 720).toFile("deskstop-1280x720.png");
await sharp("narrow-720x1280.png").resize(720, 1280).toFile("mobisle-720x1280.png");
console.log("Screens made");