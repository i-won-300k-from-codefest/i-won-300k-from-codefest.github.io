"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useFamily } from "@/contexts/FamilyContext";

interface ShelterFeature {
  type: string;
  properties: {
    類別: string;
    地址: string;
    經度: string;
    緯度: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

// You'll need to add your Mapbox access token here
// Get one from https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.YOUR_MAPBOX_TOKEN_HERE";

mapboxgl.accessToken = MAPBOX_TOKEN;

export function ShelterMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { familyData, setCommonShelter } = useFamily();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on New Taipei City
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [121.4685, 25.0458], // New Taipei City coordinates
      zoom: 11,
    });

    map.current.on("load", async () => {
      if (!map.current) return;

      try {
        // Load the shelter data from both cities
        const [newTaipeiResponse, taipeiResponse] = await Promise.all([
          fetch("/json/新北市.json"),
          fetch("/json/臺北市.json"),
        ]);

        const newTaipeiData = await newTaipeiResponse.json();
        const taipeiData = await taipeiResponse.json();

        // Combine shelter data from both cities
        const shelterData = {
          type: "FeatureCollection" as const,
          features: [...newTaipeiData.features, ...taipeiData.features],
        };

        // Helper function to check if coordinates match a shelter (within ~10 meters)
        const findShelterAtLocation = (coords: [number, number]) => {
          const [lng, lat] = coords;
          return shelterData.features.find((feature: ShelterFeature) => {
            const [shelterLng, shelterLat] = feature.geometry.coordinates;
            const distance = Math.sqrt(
              Math.pow(shelterLng - lng, 2) + Math.pow(shelterLat - lat, 2),
            );
            return distance < 0.0001; // approximately 10 meters
          });
        };

        // Add the shelter data as a source
        map.current.addSource("shelters", {
          type: "geojson",
          data: shelterData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Add cluster circle layer with design system colors
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "shelters",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#5ab4c5", // primary-500
              100,
              "#f5ba4b", // secondary-500
              750,
              "#fd853a", // orange-500
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
            "circle-opacity": 0.9,
          },
        });

        // Add cluster count layer
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "shelters",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add unclustered point layer (individual shelters) with primary color
        // Hide shelters that are the common shelter (they'll be shown in a separate layer)
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "shelters",
          filter: [
            "all",
            ["!", ["has", "point_count"]],
            [
              "!=",
              ["get", "地址"],
              familyData.commonShelter?.address || "",
            ],
          ],
          paint: {
            "circle-color": "#5ab4c5", // primary-500
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.9,
          },
        });

        // Add common shelter layer with special highlighting (star icon)
        if (familyData.commonShelter) {
          // Create a star icon using canvas
          const createStarIcon = () => {
            const size = 64;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              // Draw outer glow circle
              const gradient = ctx.createRadialGradient(
                size / 2,
                size / 2,
                size / 4,
                size / 2,
                size / 2,
                size / 2,
              );
              gradient.addColorStop(0, "rgba(245, 186, 75, 0.4)"); // secondary with opacity
              gradient.addColorStop(1, "rgba(245, 186, 75, 0)");
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
              ctx.fill();

              // Draw star
              const spikes = 5;
              const outerRadius = size / 3;
              const innerRadius = size / 6;
              const centerX = size / 2;
              const centerY = size / 2;

              ctx.beginPath();
              for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                if (i === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
              ctx.closePath();
              ctx.fillStyle = "#f5ba4b"; // secondary-500 (yellow)
              ctx.fill();
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            return canvas;
          };

          const starCanvas = createStarIcon();
          starCanvas.toBlob((blob) => {
            if (blob && map.current) {
              createImageBitmap(blob).then((imageBitmap) => {
                if (map.current) {
                  map.current.addImage("common-shelter-star", imageBitmap, {
                    sdf: false,
                  });

                  // Add common shelter point layer with star icon
                  map.current.addLayer({
                    id: "common-shelter-point",
                    type: "symbol",
                    source: "shelters",
                    filter: [
                      "all",
                      ["!", ["has", "point_count"]],
                      [
                        "==",
                        ["get", "地址"],
                        familyData.commonShelter?.address || "",
                      ],
                    ],
                    layout: {
                      "icon-image": "common-shelter-star",
                      "icon-size": 1,
                      "icon-allow-overlap": true,
                      "icon-anchor": "center",
                    },
                  });
                }
              });
            }
          });
        }

        // Load avatar images for emergency contacts
        const avatarPromises = familyData.members.map((contact) => {
            return new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                // Check if contact is at shelter
                const shelter = findShelterAtLocation(contact.coordinates);
                const isAtShelter = !!shelter;

                // Create a canvas to draw the circular avatar with border
                const size = 128;
                const borderWidth = 6;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");

                if (ctx && map.current) {
                  // Clear canvas
                  ctx.clearRect(0, 0, size, size);

                  // Draw border circle - primary color if at shelter, red if outside
                  ctx.beginPath();
                  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                  ctx.fillStyle = isAtShelter ? "#5ab4c5" : "#ef4444"; // primary-500 or red-500
                  ctx.fill();

                  // Draw white inner circle for spacing
                  ctx.beginPath();
                  ctx.arc(
                    size / 2,
                    size / 2,
                    size / 2 - borderWidth,
                    0,
                    Math.PI * 2,
                  );
                  ctx.fillStyle = "#ffffff";
                  ctx.fill();

                  // Clip to circle for the image
                  ctx.beginPath();
                  ctx.arc(
                    size / 2,
                    size / 2,
                    size / 2 - borderWidth,
                    0,
                    Math.PI * 2,
                  );
                  ctx.clip();

                  // Calculate dimensions to fit image in circle without stretching
                  const scale = Math.max(size / img.width, size / img.height);
                  const scaledWidth = img.width * scale;
                  const scaledHeight = img.height * scale;
                  const x = (size - scaledWidth) / 2;
                  const y = (size - scaledHeight) / 2;

                  // Draw the image
                  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

                  // Convert canvas to image data
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const arrayBuffer = reader.result as ArrayBuffer;
                        const uint8Array = new Uint8Array(arrayBuffer);
                        createImageBitmap(blob).then((imageBitmap) => {
                          if (map.current) {
                            map.current.addImage(
                              `avatar-${contact.id}`,
                              imageBitmap,
                              {
                                sdf: false,
                              },
                            );
                          }
                          resolve();
                        });
                      };
                      reader.readAsArrayBuffer(blob);
                    } else {
                      resolve();
                    }
                  });
                } else {
                  resolve();
                }
              };
              img.onerror = () => {
                console.error(`Error loading avatar ${contact.avatar}`);
                reject(new Error(`Failed to load ${contact.avatar}`));
              };
              img.src = contact.avatar;
            });
          },
        );

        await Promise.all(avatarPromises);

        // Add emergency contacts as a source
        const contactsGeoJSON = {
          type: "FeatureCollection" as const,
          features: familyData.members.map((contact) => {
            const shelter = findShelterAtLocation(contact.coordinates);
            const isAtShelter = !!shelter;

            return {
              type: "Feature",
              properties: {
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                relation: contact.relation,
                status: isAtShelter ? "at_shelter" : "outside",
                shelterName: shelter?.properties.類別 || null,
                shelterAddress: shelter?.properties.地址 || null,
              },
              geometry: {
                type: "Point",
                coordinates: contact.coordinates,
              },
            };
          }),
        };

        map.current.addSource("emergency-contacts", {
          type: "geojson",
          data: contactsGeoJSON as any,
        });

        // Add emergency contacts layer with avatar icons
        map.current.addLayer({
          id: "emergency-contacts",
          type: "symbol",
          source: "emergency-contacts",
          layout: {
            "icon-image": ["concat", "avatar-", ["get", "id"]],
            "icon-size": 0.5,
            "icon-allow-overlap": true,
            "icon-anchor": "center",
          },
        });

        // Add click event for clusters
        map.current.on("click", "clusters", (e) => {
          if (!map.current) return;
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current.getSource(
            "shelters",
          ) as mapboxgl.GeoJSONSource;

          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !map.current || zoom === null || zoom === undefined)
              return;

            map.current.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom,
            });
          });
        });

        // Add click event for individual shelters
        const handleShelterClick = (e: mapboxgl.MapMouseEvent) => {
          if (!map.current || !e.features || e.features.length === 0) return;

          const coordinates = (
            e.features[0].geometry as any
          ).coordinates.slice();
          const properties = e.features[0].properties;

          // Detect dark mode
          const isDark = document.documentElement.classList.contains("dark");

          // Create popup content with inline Tailwind color values and button to set as common shelter
          const popupContent = `
            <div class="shelter-popup">
              <h3 class="shelter-popup-title">${properties?.類別 || "N/A"}</h3>
              <div class="shelter-popup-content">
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">地址:</span>
                  <span class="shelter-popup-value">${properties?.地址 || "N/A"}</span>
                </div>
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">村里別:</span>
                  <span class="shelter-popup-value">${properties?.村里別 || "N/A"}</span>
                </div>
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">可容納人數:</span>
                  <span class="shelter-popup-value">${properties?.可容納人數 || "N/A"}</span>
                </div>
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">地下樓層數:</span>
                  <span class="shelter-popup-value">${properties?.["地下樓 層數"] || "N/A"}</span>
                </div>
                ${
                  properties?.派出所
                    ? `
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">派出所:</span>
                  <span class="shelter-popup-value">${properties.派出所}</span>
                </div>
                `
                    : ""
                }
              </div>
              <button
                class="common-shelter-button"
                data-shelter-address="${properties?.地址 || ""}"
                data-shelter-lng="${coordinates[0]}"
                data-shelter-lat="${coordinates[1]}"
                data-shelter-name="${properties?.類別 || ""}"
              >
                設為家庭集合避難所
              </button>
            </div>
          `;

          const popup = new mapboxgl.Popup({
            maxWidth: "320px",
            className: `shelter-popup-container ${isDark ? "dark" : ""}`,
          })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map.current);

          // Add event listener to the button after popup is added
          setTimeout(() => {
            const button = document.querySelector(".common-shelter-button");
            if (button) {
              button.addEventListener("click", () => {
                const address = button.getAttribute("data-shelter-address");
                const lng = parseFloat(
                  button.getAttribute("data-shelter-lng") || "0",
                );
                const lat = parseFloat(
                  button.getAttribute("data-shelter-lat") || "0",
                );
                const name = button.getAttribute("data-shelter-name");

                if (address && lng && lat) {
                  setCommonShelter({
                    address,
                    coordinates: [lng, lat],
                    name: name || undefined,
                  });
                  popup.remove();
                }
              });
            }
          }, 0);
        };

        map.current.on("click", "unclustered-point", handleShelterClick);

        // Add click handler for common shelter too
        if (familyData.commonShelter) {
          map.current.on("click", "common-shelter-point", handleShelterClick);
        }

        // Change cursor on hover
        map.current.on("mouseenter", "clusters", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "clusters", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
        map.current.on("mouseenter", "unclustered-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "unclustered-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        // Add hover effects for common shelter
        if (familyData.commonShelter) {
          map.current.on("mouseenter", "common-shelter-point", () => {
            if (map.current) map.current.getCanvas().style.cursor = "pointer";
          });
          map.current.on("mouseleave", "common-shelter-point", () => {
            if (map.current) map.current.getCanvas().style.cursor = "";
          });
        }

        // Add click event for emergency contacts
        map.current.on("click", "emergency-contacts", (e) => {
          if (!map.current || !e.features || e.features.length === 0) return;

          const coordinates = (
            e.features[0].geometry as any
          ).coordinates.slice();
          const properties = e.features[0].properties;

          // Detect dark mode
          const isDark = document.documentElement.classList.contains("dark");

          // Create popup content for emergency contacts
          const isAtShelter = properties?.status === "at_shelter";
          const statusBadge = isAtShelter
            ? `<span class="contact-status-badge at-shelter">在避難所</span>`
            : `<span class="contact-status-badge outside">在外</span>`;

          const locationInfo = isAtShelter
            ? `
                <div class="contact-popup-row">
                  <span class="contact-popup-label">避難所:</span>
                  <span class="contact-popup-value">${properties?.shelterName || "N/A"}</span>
                </div>
                <div class="contact-popup-row">
                  <span class="contact-popup-label">地址:</span>
                  <span class="contact-popup-value">${properties?.shelterAddress || "N/A"}</span>
                </div>
              `
            : `
                <div class="contact-popup-row">
                  <span class="contact-popup-label">位置:</span>
                  <span class="contact-popup-value">座標: ${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}</span>
                </div>
              `;

          const popupContent = `
            <div class="contact-popup">
              <div class="contact-popup-header">
                <h3 class="contact-popup-title">${properties?.name || "N/A"}</h3>
                ${statusBadge}
              </div>
              <div class="contact-popup-content">
                <div class="contact-popup-row">
                  <span class="contact-popup-label">關係:</span>
                  <span class="contact-popup-value">${properties?.relation || "N/A"}</span>
                </div>
                <div class="contact-popup-row">
                  <span class="contact-popup-label">電話:</span>
                  <span class="contact-popup-value">${properties?.phone || "N/A"}</span>
                </div>
                ${locationInfo}
              </div>
            </div>
          `;

          new mapboxgl.Popup({
            maxWidth: "320px",
            className: `contact-popup-container ${isDark ? "dark" : ""}`,
          })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map.current);
        });

        // Change cursor on hover for emergency contacts
        map.current.on("mouseenter", "emergency-contacts", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "emergency-contacts", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading shelter data:", error);
        setIsLoading(false);
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [familyData.members, familyData.commonShelter, setCommonShelter]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/75 backdrop-blur-sm">
          <div className="text-muted-foreground font-medium">
            正在載入地圖...
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Light mode colors */
        .shelter-popup-container .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.625rem;
          background-color: #ffffff;
          color: #171b1d;
          box-shadow:
            0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1);
          border: 1px solid #e3e7e9;
        }

        .shelter-popup-container .mapboxgl-popup-tip {
          border-top-color: #ffffff;
        }

        .shelter-popup-container .mapboxgl-popup-close-button {
          color: #5e6d76;
          font-size: 20px;
          padding: 8px;
          right: 4px;
          top: 4px;
          transition: color 0.2s;
        }

        .shelter-popup-container .mapboxgl-popup-close-button:hover {
          color: #171b1d;
          background-color: transparent;
        }

        /* Dark mode colors */
        .shelter-popup-container.dark .mapboxgl-popup-content {
          background-color: #30383d;
          color: #ffffff;
          border: 1px solid #30383d;
        }

        .shelter-popup-container.dark .mapboxgl-popup-tip {
          border-top-color: #30383d;
        }

        .shelter-popup-container.dark .mapboxgl-popup-close-button {
          color: #cad1d5;
        }

        .shelter-popup-container.dark .mapboxgl-popup-close-button:hover {
          color: #ffffff;
        }

        .shelter-popup {
          padding: 16px;
          min-width: 240px;
        }

        .shelter-popup-title {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #5ab4c5;
          border-bottom: 2px solid #5ab4c5;
          padding-bottom: 8px;
        }

        .shelter-popup-container.dark .shelter-popup-title {
          color: #71c5d5;
          border-bottom-color: #71c5d5;
        }

        .shelter-popup-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shelter-popup-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .shelter-popup-label {
          font-weight: 600;
          color: #5e6d76;
          white-space: nowrap;
        }

        .shelter-popup-container.dark .shelter-popup-label {
          color: #cad1d5;
        }

        .shelter-popup-value {
          color: #171b1d;
          flex: 1;
        }

        .shelter-popup-container.dark .shelter-popup-value {
          color: #ffffff;
        }

        /* Emergency Contact Popup Styles */
        .contact-popup-container .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.625rem;
          background-color: #ffffff;
          color: #171b1d;
          box-shadow:
            0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1);
          border: 1px solid #e3e7e9;
        }

        .contact-popup-container .mapboxgl-popup-tip {
          border-top-color: #ffffff;
        }

        .contact-popup-container .mapboxgl-popup-close-button {
          color: #5e6d76;
          font-size: 20px;
          padding: 8px;
          right: 4px;
          top: 4px;
          transition: color 0.2s;
        }

        .contact-popup-container .mapboxgl-popup-close-button:hover {
          color: #171b1d;
          background-color: transparent;
        }

        .contact-popup-container.dark .mapboxgl-popup-content {
          background-color: #30383d;
          color: #ffffff;
          border: 1px solid #30383d;
        }

        .contact-popup-container.dark .mapboxgl-popup-tip {
          border-top-color: #30383d;
        }

        .contact-popup-container.dark .mapboxgl-popup-close-button {
          color: #cad1d5;
        }

        .contact-popup-container.dark .mapboxgl-popup-close-button:hover {
          color: #ffffff;
        }

        .contact-popup {
          padding: 16px;
          min-width: 280px;
        }

        .contact-popup-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          padding-right: 32px;
          border-bottom: 2px solid #fd853a;
        }

        .contact-popup-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #fd853a;
          min-width: 0;
        }

        .contact-popup-container.dark .contact-popup-title {
          color: #fe9d5d;
        }

        .contact-status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 9999px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .contact-status-badge.at-shelter {
          background-color: #5ab4c5;
          color: #ffffff;
        }

        .contact-popup-container.dark .contact-status-badge.at-shelter {
          background-color: #71c5d5;
          color: #171b1d;
        }

        .contact-status-badge.outside {
          background-color: #f5ba4b;
          color: #171b1d;
        }

        .contact-popup-container.dark .contact-status-badge.outside {
          background-color: #f7c968;
          color: #171b1d;
        }

        .contact-popup-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-popup-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .contact-popup-label {
          font-weight: 600;
          color: #5e6d76;
          white-space: nowrap;
        }

        .contact-popup-container.dark .contact-popup-label {
          color: #cad1d5;
        }

        .contact-popup-value {
          color: #171b1d;
          flex: 1;
        }

        .contact-popup-container.dark .contact-popup-value {
          color: #ffffff;
        }

        /* Common Shelter Button Styles */
        .common-shelter-button {
          width: 100%;
          margin-top: 12px;
          padding: 10px 16px;
          background-color: #f5ba4b;
          color: #171b1d;
          font-weight: 600;
          font-size: 13px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .common-shelter-button:hover {
          background-color: #f7c968;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .common-shelter-button:active {
          transform: translateY(0);
        }

        .shelter-popup-container.dark .common-shelter-button {
          background-color: #f5ba4b;
          color: #171b1d;
        }

        .shelter-popup-container.dark .common-shelter-button:hover {
          background-color: #f7c968;
        }
      `}</style>
    </div>
  );
}
