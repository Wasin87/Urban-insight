import React, { useRef } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLoaderData } from "react-router";

const Coverage = () => {
    const position = [23.6850, 90.3563];
    const serviceCenters = useLoaderData();
    const mapRef = useRef(null);

    // Search Handler
    const handleSearch = (e) => {
        e.preventDefault();
        const location = e.target.location.value.trim();

        if (!location) return;

        const district = serviceCenters.find((c) =>
            c.district.toLowerCase().includes(location.toLowerCase())
        );

        if (district) {
            const coord = [district.latitude, district.longitude];
            mapRef.current.flyTo(coord, 13);
        }
    };

    return (
        <div className="py-10">
            {/* Title Section */}
            <div className="text-center mb-10 space-y-3">
                <h2 className="text-5xl font-extrabold text-gray-800">
                    Nationwide Coverage Across <span className="text-secondary">64 Districts</span>
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    We ensure fast, secure, and reliable delivery service across Bangladesh.  
                    Explore our coverage areas and locate our nearest service centers.
                </p>
            </div>

            {/* Search Section */}
            <div className="flex justify-center mb-8">
                <form
                    onSubmit={handleSearch}
                    className="w-full max-w-lg shadow-lg bg-white rounded-2xl px-5 py-3 flex items-center gap-3 border"
                >
                    <svg
                        className="h-6 w-6 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                    >
                        <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2"
                            fill="none"
                            stroke="currentColor"
                        >
                            <circle cx="10" cy="10" r="7"></circle>
                            <path d="m21 21-4.5-4.5"></path>
                        </g>
                    </svg>

                    <input
                        type="search"
                        name="location"
                        className="grow outline-none text-gray-700"
                        placeholder="Search by district name..."
                    />

                    <button
                        className="bg-lime-600 hover:bg-secondary/90 text-white font-semibold px-5 py-2 rounded-xl transition-all"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Map Section */}
            <div className="px-6">
                <div className="w-full h-[650px] rounded-2xl overflow-hidden shadow-2xl border bg-white">
                    <MapContainer
                        center={position}
                        zoom={7.5}
                        scrollWheelZoom={false}
                        className="h-[650px]"
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {serviceCenters.map((center, index) => (
                            <Marker
                                key={index}
                                position={[center.latitude, center.longitude]}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -10]}
                                    opacity={1}
                                >
                                    <span className="font-semibold">
                                        {center.district}
                                    </span>
                                    <br />
                                    {center.covered_area.join(", ")}
                                </Tooltip>

                                <Popup>
                                    <strong>{center.district}</strong>
                                    <br />
                                    Service Area: {center.covered_area.join(", ")}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default Coverage;
