# Map Data Integration Guide for LocationDrawer

This guide shows how to integrate LocationDrawer with your map data **without a backend**.

## Overview

The LocationDrawer uses a callback system to generate questions dynamically based on your map data. All logic runs in the browser.

## Quick Setup

### 1. Prepare Your Map Data

Create a JSON file with your map structure:

```json
// public/data/map.json
{
  "floors": [-1, 1, 2, 3, 4, 5],
  "locations": [
    {
      "id": "restaurant-1",
      "name": "美食街",
      "type": "restaurant",
      "floor": 3,
      "coordinates": { "x": 100, "y": 200 },
      "nearbyLandmarks": ["elevator-a", "stairs-1"],
      "sections": ["inside", "queue", "counter"]
    },
    {
      "id": "entrance-main",
      "name": "正門",
      "type": "entrance",
      "floor": 1,
      "coordinates": { "x": 50, "y": 50 },
      "nearbyLandmarks": ["exit-north"]
    }
  ],
  "landmarks": [
    { "id": "elevator-a", "name": "電梯A", "type": "elevator" },
    { "id": "stairs-1", "name": "樓梯1", "type": "stairs" }
  ]
}
```

### 2. Load Map Data

```tsx
"use client";

import { useState, useEffect } from "react";
import { LocationDrawer, Question, Answer } from "./LocationDrawer";

export function MapLocationDrawer() {
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    // Load map data on mount
    fetch("/data/map.json")
      .then((res) => res.json())
      .then((data) => setMapData(data));
  }, []);

  if (!mapData) {
    return <div>載入地圖中...</div>;
  }

  return <LocationDrawerWithMap mapData={mapData} />;
}
```

### 3. Create Question Flow

```tsx
function LocationDrawerWithMap({ mapData }) {
  const initialQuestion: Question = {
    id: "floor",
    title: "您在哪一樓？",
    options: mapData.floors.map((floor) => ({
      value: floor.toString(),
      label: floor > 0 ? `${floor}樓` : `B${Math.abs(floor)}`,
    })),
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    // Build answer map for easy access
    const answerMap = {};
    answers.forEach((a) => {
      answerMap[a.questionId] = a.value;
    });

    // Question 2: Location Type
    if (answers.length === 1) {
      const floor = parseInt(answerMap.floor);

      // Get locations on this floor
      const locationsOnFloor = mapData.locations.filter(
        (loc) => loc.floor === floor
      );

      // Get unique types
      const types = [...new Set(locationsOnFloor.map((loc) => loc.type))];

      return {
        id: "location-type",
        title: "您靠近什麼地點？",
        options: types.map((type) => ({
          value: type,
          label: getTypeLabel(type),
        })),
      };
    }

    // Question 3: Specific Location
    if (answers.length === 2) {
      const floor = parseInt(answerMap.floor);
      const type = answerMap["location-type"];

      const locations = mapData.locations.filter(
        (loc) => loc.floor === floor && loc.type === type
      );

      if (locations.length === 1) {
        // Auto-select if only one option
        return null; // Or continue to next question
      }

      return {
        id: "specific-location",
        title: `是哪個${getTypeLabel(type)}？`,
        options: locations.map((loc) => ({
          value: loc.id,
          label: loc.name,
        })),
      };
    }

    // Done
    return null;
  };

  const handleComplete = (answers: Answer[]) => {
    // Get the selected location
    const locationId = answers.find(
      (a) => a.questionId === "specific-location"
    )?.value;

    const location = mapData.locations.find((loc) => loc.id === locationId);

    console.log("User is at:", location);

    // Update your map view
    showUserPositionOnMap(location.coordinates);
  };

  return (
    <LocationDrawer
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}

function getTypeLabel(type: string): string {
  const labels = {
    restaurant: "餐廳",
    entrance: "入口",
    restroom: "廁所",
    shop: "商店",
  };
  return labels[type] || type;
}
```

## Complete Example with All Features

```tsx
"use client";

import { useState, useEffect } from "react";
import { LocationDrawer, Question, Answer } from "./LocationDrawer";

export function FullMapLocationDrawer() {
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    fetch("/data/map.json")
      .then((res) => res.json())
      .then(setMapData);
  }, []);

  if (!mapData) return <div>載入中...</div>;

  const initialQuestion: Question = {
    id: "floor",
    title: "您在哪一樓？",
    description: "請選擇您目前所在的樓層",
    options: mapData.floors.map((floor) => ({
      value: floor.toString(),
      label: floor > 0 ? `${floor}樓` : `B${Math.abs(floor)}`,
    })),
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    // Optional: Add delay to show loading indicator
    await new Promise((resolve) => setTimeout(resolve, 200));

    const answerMap = answers.reduce((acc, a) => {
      acc[a.questionId] = a.value;
      return acc;
    }, {});

    // Step 1: Floor selected
    if (answers.length === 1) {
      const floor = parseInt(answerMap.floor);
      const locationsOnFloor = mapData.locations.filter(
        (loc) => loc.floor === floor
      );
      const types = [...new Set(locationsOnFloor.map((loc) => loc.type))];

      return {
        id: "location-type",
        title: "您靠近什麼地點？",
        options: types.map((type) => ({
          value: type,
          label: getTypeLabel(type),
        })),
      };
    }

    // Step 2: Type selected
    if (answers.length === 2) {
      const floor = parseInt(answerMap.floor);
      const type = answerMap["location-type"];
      const locations = mapData.locations.filter(
        (loc) => loc.floor === floor && loc.type === type
      );

      if (locations.length === 1) {
        // Auto-select and continue to sections
        const location = locations[0];
        if (location.sections && location.sections.length > 0) {
          return getSectionQuestion(location);
        }
        return getLandmarkQuestion(location);
      }

      return {
        id: "specific-location",
        title: `是哪個${getTypeLabel(type)}？`,
        options: locations.map((loc) => ({
          value: loc.id,
          label: loc.name,
        })),
      };
    }

    // Step 3: Specific location selected
    if (answers.length === 3) {
      const locationId = answerMap["specific-location"];
      const location = mapData.locations.find((loc) => loc.id === locationId);

      if (location?.sections && location.sections.length > 0) {
        return getSectionQuestion(location);
      }
      return getLandmarkQuestion(location);
    }

    // Step 4: Section selected
    if (answers.length === 4) {
      const locationId = answerMap["specific-location"];
      const location = mapData.locations.find((loc) => loc.id === locationId);
      return getLandmarkQuestion(location);
    }

    // Done
    return null;
  };

  const getSectionQuestion = (location) => {
    const sectionLabels = {
      inside: "內部",
      queue: "排隊區",
      counter: "櫃檯",
      checkout: "結帳處",
      browsing: "瀏覽區",
      mens: "男廁",
      womens: "女廁",
      accessible: "無障礙廁所",
    };

    return {
      id: "section",
      title: "您在哪個區域？",
      description: location.name,
      options: location.sections.map((section) => ({
        value: section,
        label: sectionLabels[section] || section,
      })),
    };
  };

  const getLandmarkQuestion = (location) => {
    const landmarks = mapData.landmarks.filter((l) =>
      location.nearbyLandmarks.includes(l.id)
    );

    if (landmarks.length === 0) return null;

    return {
      id: "landmark",
      title: "您最靠近哪個地標？",
      description: "最後一步，幫助精確定位",
      options: [
        ...landmarks.map((l) => ({ value: l.id, label: l.name })),
        { value: "none", label: "都不靠近" },
      ],
    };
  };

  const handleComplete = (answers: Answer[]) => {
    const result = {
      floor: answers.find((a) => a.questionId === "floor")?.value,
      locationType: answers.find((a) => a.questionId === "location-type")?.value,
      locationId: answers.find((a) => a.questionId === "specific-location")?.value,
      section: answers.find((a) => a.questionId === "section")?.value,
      landmark: answers.find((a) => a.questionId === "landmark")?.value,
    };

    const location = mapData.locations.find((loc) => loc.id === result.locationId);

    console.log("📍 User location:", result);
    console.log("🗺️ Coordinates:", location?.coordinates);

    // Update your map/UI here
  };

  return (
    <LocationDrawer
      triggerLabel="我在哪裡"
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}

function getTypeLabel(type: string): string {
  const labels = {
    restaurant: "餐廳",
    entrance: "入口",
    restroom: "廁所",
    shop: "商店",
  };
  return labels[type] || type;
}
```

## Map Data Structure

### Recommended Schema

```typescript
interface MapData {
  floors: number[];              // [-1, 1, 2, 3, 4, 5]
  locations: Location[];
  landmarks: Landmark[];
}

interface Location {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: string;                  // "restaurant", "entrance", etc.
  floor: number;                 // Which floor
  coordinates: { x: number; y: number }; // Position on map
  nearbyLandmarks: string[];     // IDs of nearby landmarks
  sections?: string[];           // Optional sub-areas
}

interface Landmark {
  id: string;
  name: string;
  type: string;                  // "elevator", "stairs", "exit"
}
```

### Example Map Data

```json
{
  "floors": [-1, 1, 2, 3, 4, 5],
  "locations": [
    {
      "id": "rest-food-court",
      "name": "美食街",
      "type": "restaurant",
      "floor": 3,
      "coordinates": { "x": 100, "y": 200 },
      "nearbyLandmarks": ["elevator-a", "stairs-1"],
      "sections": ["inside", "queue", "counter"]
    },
    {
      "id": "rest-japanese",
      "name": "日式料理",
      "type": "restaurant",
      "floor": 2,
      "coordinates": { "x": 150, "y": 180 },
      "nearbyLandmarks": ["elevator-b"],
      "sections": ["inside", "queue"]
    },
    {
      "id": "entrance-main",
      "name": "正門",
      "type": "entrance",
      "floor": 1,
      "coordinates": { "x": 50, "y": 50 },
      "nearbyLandmarks": ["exit-north"]
    }
  ],
  "landmarks": [
    { "id": "elevator-a", "name": "電梯A", "type": "elevator" },
    { "id": "elevator-b", "name": "電梯B", "type": "elevator" },
    { "id": "stairs-1", "name": "樓梯1", "type": "stairs" },
    { "id": "exit-north", "name": "北側出口", "type": "exit" }
  ]
}
```

## Tips & Best Practices

### 1. Loading State

Always show a loading state while map data loads:

```tsx
if (!mapData) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary" />
      <span className="ml-3">載入地圖資料中...</span>
    </div>
  );
}
```

### 2. Auto-Skip Single Options

If there's only one option, auto-select it:

```tsx
if (locations.length === 1) {
  // Skip this question and move to next
  return getNextQuestion(locations[0]);
}
```

### 3. Add Loading Delay

Make the loading popout visible by adding a small delay:

```tsx
const handleAnswer = async (answers) => {
  // Add 200-500ms delay to show loading indicator
  await new Promise(resolve => setTimeout(resolve, 300));

  // Your logic here...
};
```

### 4. Handle Edge Cases

```tsx
// No locations on this floor
if (locationsOnFloor.length === 0) {
  return {
    id: "no-locations",
    title: "此樓層無標記地點",
    description: "請描述您看到的特徵",
    options: [
      { value: "corridor", label: "走廊" },
      { value: "open", label: "開放空間" },
    ],
  };
}
```

### 5. Caching Map Data

```tsx
// Cache in localStorage to avoid reloading
const [mapData, setMapData] = useState(() => {
  const cached = localStorage.getItem("mapData");
  return cached ? JSON.parse(cached) : null;
});

useEffect(() => {
  if (!mapData) {
    fetch("/data/map.json")
      .then((res) => res.json())
      .then((data) => {
        setMapData(data);
        localStorage.setItem("mapData", JSON.stringify(data));
      });
  }
}, [mapData]);
```

## Integration with Map View

After user completes the flow:

```tsx
const handleComplete = (answers: Answer[]) => {
  const locationId = answers.find(
    (a) => a.questionId === "specific-location"
  )?.value;

  const location = mapData.locations.find((loc) => loc.id === locationId);

  if (location) {
    // Highlight user position on map
    highlightUserPosition(location.coordinates);

    // Zoom to user location
    zoomToCoordinates(location.coordinates, location.floor);

    // Store in app state
    setUserLocation({
      position: location.coordinates,
      floor: location.floor,
      name: location.name,
    });
  }
};

function highlightUserPosition(coords: { x: number; y: number }) {
  // Your map library code to show user pin
}

function zoomToCoordinates(coords: { x: number; y: number }, floor: number) {
  // Your map library code to zoom
}
```

## Advanced: Multi-language Support

```tsx
const translations = {
  zh: {
    floor: "您在哪一樓？",
    locationTypes: {
      restaurant: "餐廳",
      entrance: "入口",
      restroom: "廁所",
      shop: "商店",
    },
  },
  en: {
    floor: "Which floor are you on?",
    locationTypes: {
      restaurant: "Restaurant",
      entrance: "Entrance",
      restroom: "Restroom",
      shop: "Shop",
    },
  },
};

// Use in your questions
title: translations[currentLang].floor
```

## Troubleshooting

**Map data not loading?**
- Check the file path is correct (`/data/map.json`)
- Ensure the JSON is valid
- Check browser console for errors

**Questions not appearing?**
- Verify `onAnswer` returns a Question object or null
- Check that question IDs are unique
- Look for console errors

**Loading popout too fast?**
- Add `await new Promise(resolve => setTimeout(resolve, 300))` in `onAnswer`
- The loading popout will show for minimum 500ms

**Back button not working?**
- Make sure `onAnswer` is deterministic (same input = same output)
- Check you're not using random logic

## Next Steps

1. ✅ Prepare your map data JSON
2. ✅ Load it in your component
3. ✅ Implement `onAnswer` based on your map structure
4. ✅ Connect `onComplete` to your map view
5. ✅ Test the flow with different scenarios

See `LocationDrawer.MapExample.tsx` for a complete working example!
