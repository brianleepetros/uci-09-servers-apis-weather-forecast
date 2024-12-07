import { Router } from "express";
const router = Router();
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";
// TODO: POST Request with city name to retrieve weather data
router.post("/", (req, res) => {
    // TODO: GET weather data from city name
    // TODO: save city to search history
    try {
        const cityName = req.body.cityName;
        WeatherService.getWeatherForCity(cityName).then((data) => {
            HistoryService.addCity(cityName);
            res.json(data);
        });
    }
    catch (error) {
        res.status(500).json(error);
    }
});
// TODO: GET search history
router.get("/history", async (_req, res) => {
    HistoryService.getCities()
        .then((data) => {
        return res.json(data);
    })
        .catch((err) => {
        res.status(500).json(err);
    });
});
// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({ error: "City ID is required" });
            return;
        }
        await HistoryService.removeCity(req.params.id);
        res.json({ success: "Removed city from search history" });
    }
    catch (error) {
        res.status(500).json(error);
    }
});
export default router;
