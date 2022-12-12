"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const external_service_1 = require("./services/external.service");
const video_service_1 = require("./services/video.service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:4000",
}));
app.enable("trust proxy");
app.use((0, morgan_1.default)("combined"));
// Frontend as staticfiles
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use(express_1.default.static(path_1.default.join(__dirname, "../../client/build")));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../client/build"));
});
app.get("/turn-server", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const turnServerURLs = yield (0, external_service_1.getTwilioTurnServer)();
    return res.status(200).json({ data: turnServerURLs });
}));
app.get("/get-avatar", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    if (category !== "male" && category !== "female") {
        return res.status(400).json({
            error: `${category} is not a valid category. input either male or female`,
        });
    }
    const randomImage = yield (0, video_service_1.generateRandomImages)(category);
    return res.status(200).json({ data: `${baseUrl}/${randomImage}` });
}));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../client/build"));
});
// Server images staticfiles directory
app.use(express_1.default.static("public"));
app.use("/images", express_1.default.static("images"));
app.use("/sounds", express_1.default.static("sounds"));
exports.default = app;
