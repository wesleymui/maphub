import { Request, Response } from 'express';
import auth from '../auth/index';
import mongoose from 'mongoose';
import Map from '../models/map-model';
import express from 'express';
import fs from 'fs';
import path from 'path';

enum MapType {
  CHOROPLETH = 'choropleth',
  CATEGORICAL = 'categorical',
  SYMBOL = 'symbol',
  DOT = 'dot',
  FLOW = 'flow',
}

const MapController = {
  createMap: async (req: Request, res: Response) => {
    // Implementation of creating a map
    const {
      title,
      owner,
      mapType,
      labels,
      globalChoroplethData,
      globalCategoryData,
      globalSymbolData,
      globalDotDensityData,
      regionsData,
      symbolsData,
      dotsData,
      arrowsData,
      geoJSON,
    } = req.body;
    let newMap;
    try {
      const placeholderID = new mongoose.Types.ObjectId();

      newMap = new Map({
        title,
        placeholderID,
        mapType,
        labels,
        globalChoroplethData,
        globalCategoryData,
        globalSymbolData,
        globalDotDensityData,
        regionsData,
        symbolsData,
        dotsData,
        arrowsData,
        geoJSON: 'placeholder',
      });
      await newMap.save();
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: `map saving error: ${err.message}` });
    }

    const mapID = newMap._id.toString();
    const saveFilePath = `server/jsonStore/${mapID}.geojson`;

    try {
      await fs.promises.writeFile(saveFilePath, JSON.stringify(geoJSON));
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: `File system error: ${err.messge}` });
    }

    try {
      newMap.geoJSON = saveFilePath;
      newMap = await newMap.save();
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: `DB geoJSON path update error: ${err.message}` });
    }

    res.status(200).json({
      success: true,
      mapID: mapID,
    });
  },

  updateMap: async (req: Request, res: Response) => {
    // Implementation of updating a map
  },

  deleteMapById: async (req: Request, res: Response) => {
    // Implementation of deleting a map by ID
  },

  getMapById: async (req: Request, res: Response) => {
    // Implementation of getting a map by ID
  },

  publishMapById: async (req: Request, res: Response) => {
    // Implementation of publishing a map by ID
  },
};

export default MapController;
