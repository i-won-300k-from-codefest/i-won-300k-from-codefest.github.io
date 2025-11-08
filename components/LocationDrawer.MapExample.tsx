"use client";

import { LocationDrawer, Question, Answer } from "./LocationDrawer";

/**
 * Frontend-only LocationDrawer with Map Data
 *
 * This example shows how to use LocationDrawer with map data
 * without any backend. All logic runs in the browser.
 */

// ============================================================================
// MAP DATA TYPES
// ============================================================================

interface MapLocation {
  id: string;
  name: string;
  type: "restaurant" | "entrance" | "restroom" | "shop" | "landmark";
  floor: number;
  coordinates: { x: number; y: number };
  nearbyLandmarks: string[];
  sections?: string[];
}

interface MapData {
  locations: MapLocation[];
  floors: number[];
  landmarks: { id: string; name: string; type: string }[];
}

// ============================================================================
// SAMPLE MAP DATA (Replace with your actual map data)
// ============================================================================

const MAP_DATA: MapData = {
  floors: [-1, 1, 2, 3, 4, 5],
  landmarks: [
    { id: "elevator-a", name: "電梯A", type: "elevator" },
    { id: "elevator-b", name: "電梯B", type: "elevator" },
    { id: "stairs-1", name: "樓梯1", type: "stairs" },
    { id: "exit-north", name: "北側出口", type: "exit" },
    { id: "exit-south", name: "南側出口", type: "exit" },
  ],
  locations: [
    {
      id: "restaurant-1",
      name: "美食街",
      type: "restaurant",
      floor: 3,
      coordinates: { x: 100, y: 200 },
      nearbyLandmarks: ["elevator-a", "stairs-1"],
      sections: ["inside", "queue", "counter"],
    },
    {
      id: "restaurant-2",
      name: "日式料理",
      type: "restaurant",
      floor: 2,
      coordinates: { x: 150, y: 180 },
      nearbyLandmarks: ["elevator-b"],
      sections: ["inside", "queue"],
    },
    {
      id: "entrance-main",
      name: "正門",
      type: "entrance",
      floor: 1,
      coordinates: { x: 50, y: 50 },
      nearbyLandmarks: ["exit-north"],
    },
    {
      id: "restroom-3f",
      name: "3樓廁所",
      type: "restroom",
      floor: 3,
      coordinates: { x: 250, y: 100 },
      nearbyLandmarks: ["elevator-a"],
      sections: ["mens", "womens", "accessible"],
    },
    {
      id: "shop-1",
      name: "便利商店",
      type: "shop",
      floor: 1,
      coordinates: { x: 120, y: 80 },
      nearbyLandmarks: ["entrance-main"],
      sections: ["checkout", "browsing"],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all locations of a specific type
 */
function getLocationsByType(
  type: MapLocation["type"]
): MapLocation[] {
  return MAP_DATA.locations.filter((loc) => loc.type === type);
}

/**
 * Get location by ID
 */
function getLocationById(id: string): MapLocation | undefined {
  return MAP_DATA.locations.find((loc) => loc.id === id);
}

/**
 * Get nearby landmarks for a location
 */
function getNearbyLandmarks(locationId: string) {
  const location = getLocationById(locationId);
  if (!location) return [];

  return MAP_DATA.landmarks.filter((landmark) =>
    location.nearbyLandmarks.includes(landmark.id)
  );
}

/**
 * Simulate async delay (for demonstration of loading state)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MapBasedLocationDrawer() {
  const initialQuestion: Question = {
    id: "floor",
    title: "您在哪一樓？",
    description: "請選擇您目前所在的樓層",
    options: MAP_DATA.floors.map((floor) => ({
      value: floor.toString(),
      label: floor > 0 ? `${floor}樓` : floor === 0 ? "地面層" : `B${Math.abs(floor)}`,
    })),
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    // Simulate processing time (remove or adjust in production)
    await delay(300);

    const answerMap = answers.reduce(
      (acc, answer) => {
        acc[answer.questionId] = answer.value;
        return acc;
      },
      {} as Record<string, string>
    );

    // Question 1: Floor (already asked as initial)
    // Question 2: Location Type
    if (answers.length === 1) {
      const floor = parseInt(answerMap.floor);

      // Get location types available on this floor
      const locationsOnFloor = MAP_DATA.locations.filter(
        (loc) => loc.floor === floor
      );

      const uniqueTypes = Array.from(
        new Set(locationsOnFloor.map((loc) => loc.type))
      );

      if (uniqueTypes.length === 0) {
        // No locations on this floor
        return {
          id: "no-locations",
          title: "此樓層無特定地點",
          description: "請描述您附近的特徵",
          options: [
            { value: "corridor", label: "走廊" },
            { value: "open-area", label: "開放空間" },
            { value: "other", label: "其他" },
          ],
        };
      }

      const typeLabels: Record<string, string> = {
        restaurant: "餐廳",
        entrance: "入口",
        restroom: "廁所",
        shop: "商店",
        landmark: "地標",
      };

      return {
        id: "location-type",
        title: "您靠近什麼類型的地點？",
        description: `${floor > 0 ? floor : "B" + Math.abs(floor)}樓`,
        options: uniqueTypes.map((type) => ({
          value: type,
          label: typeLabels[type] || type,
        })),
      };
    }

    // Question 3: Specific Location
    if (answers.length === 2) {
      const floor = parseInt(answerMap.floor);
      const locationType = answerMap["location-type"];

      const locationsOnFloor = MAP_DATA.locations.filter(
        (loc) => loc.floor === floor && loc.type === locationType
      );

      if (locationsOnFloor.length === 0) {
        // Skip to landmarks
        return null;
      }

      if (locationsOnFloor.length === 1) {
        // Only one location, auto-select and move to next question
        // Store it virtually and continue
        answers.push({
          questionId: "specific-location",
          value: locationsOnFloor[0].id,
          label: locationsOnFloor[0].name,
        });
        // Continue to section/landmark question
      } else {
        return {
          id: "specific-location",
          title: `是哪個${answerMap["location-type"] === "restaurant" ? "餐廳" : answerMap["location-type"] === "shop" ? "商店" : "地點"}？`,
          options: locationsOnFloor.map((loc) => ({
            value: loc.id,
            label: loc.name,
          })),
        };
      }
    }

    // Question 4: Section/Area (if location has sections)
    if (answers.length === 3) {
      const locationId =
        answerMap["specific-location"] || answers[2].value;
      const location = getLocationById(locationId);

      if (location?.sections && location.sections.length > 0) {
        const sectionLabels: Record<string, string> = {
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
      }
    }

    // Question 5: Nearby Landmark (final precision)
    if (answers.length === 4 || (answers.length === 3 && !answerMap.section)) {
      const locationId =
        answerMap["specific-location"] || answers.find((a) => a.questionId === "specific-location")?.value;

      if (locationId) {
        const landmarks = getNearbyLandmarks(locationId);

        if (landmarks.length > 0) {
          return {
            id: "landmark",
            title: "您最靠近哪個地標？",
            description: "幫助我們更精確地定位您",
            options: [
              ...landmarks.map((landmark) => ({
                value: landmark.id,
                label: landmark.name,
              })),
              { value: "none", label: "都不靠近" },
            ],
          };
        }
      }
    }

    // Flow complete
    return null;
  };

  const handleComplete = (answers: Answer[]) => {
    // Extract final location data
    const locationData = {
      floor: answers.find((a) => a.questionId === "floor")?.value,
      locationType: answers.find((a) => a.questionId === "location-type")?.value,
      specificLocation: answers.find((a) => a.questionId === "specific-location")?.value,
      section: answers.find((a) => a.questionId === "section")?.value,
      landmark: answers.find((a) => a.questionId === "landmark")?.value,
    };

    console.log("📍 User location determined:", locationData);
    console.log("📝 All answers:", answers);

    // Get full location object
    if (locationData.specificLocation) {
      const location = getLocationById(locationData.specificLocation);
      console.log("🗺️ Map coordinates:", location?.coordinates);
    }

    // Here you can:
    // 1. Show user's position on the map
    // 2. Calculate route to destination
    // 3. Update app state
    // 4. Show confirmation message
    // etc.
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

// ============================================================================
// ADVANCED: Dynamic map data loading
// ============================================================================

/**
 * Example of loading map data from JSON file
 */
export function MapBasedLocationDrawerWithDynamicData() {
  const [mapData, setMapData] = React.useState<MapData | null>(null);

  React.useEffect(() => {
    // Load map data from JSON file
    fetch("/data/map.json")
      .then((res) => res.json())
      .then((data) => setMapData(data))
      .catch((err) => console.error("Failed to load map data:", err));
  }, []);

  if (!mapData) {
    return <div>Loading map data...</div>;
  }

  // Use mapData instead of MAP_DATA constant
  // Implement same logic as above but with dynamic data
  return <div>Map-based drawer with dynamic data</div>;
}

// ============================================================================
// UTILITIES: Export for use in other components
// ============================================================================

/**
 * Parse answers into structured location data
 */
export function parseLocationAnswers(answers: Answer[]) {
  return {
    floor: answers.find((a) => a.questionId === "floor")?.value,
    floorLabel: answers.find((a) => a.questionId === "floor")?.label,
    locationType: answers.find((a) => a.questionId === "location-type")?.value,
    locationTypeLabel: answers.find((a) => a.questionId === "location-type")?.label,
    specificLocation: answers.find((a) => a.questionId === "specific-location")?.value,
    specificLocationLabel: answers.find((a) => a.questionId === "specific-location")?.label,
    section: answers.find((a) => a.questionId === "section")?.value,
    sectionLabel: answers.find((a) => a.questionId === "section")?.label,
    landmark: answers.find((a) => a.questionId === "landmark")?.value,
    landmarkLabel: answers.find((a) => a.questionId === "landmark")?.label,
  };
}

/**
 * Get coordinates from answers
 */
export function getCoordinatesFromAnswers(answers: Answer[]): { x: number; y: number } | null {
  const locationId = answers.find((a) => a.questionId === "specific-location")?.value;
  if (!locationId) return null;

  const location = getLocationById(locationId);
  return location?.coordinates || null;
}

// Need React import for the dynamic example
import React from "react";
