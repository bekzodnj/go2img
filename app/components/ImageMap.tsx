import { useState } from "react";

const ImageMap = (props: any) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });
  const [selectionInfo, setSelectionInfo] = useState(
    "Hover over the highlighted areas in the image above to see interactive hotspots.",
  );

  const poly = props.polygonsCopy as [];

  //
  let pointStringArr: any[] = [];
  poly.map((singlePolygon) => {
    let pointString = "";

    singlePolygon.points.forEach((point: any) => {
      pointString += point.x + "," + point.y + " ";
    });

    pointStringArr.push(pointString);
  });

  pointStringArr.map((pointString) => {
    return (
      <polygon
        key={pointString}
        points={pointString}
        fill="#e91e63"
        opacity="0.7"
      />
    );
  });

  console.log("pointStringArr: ", pointStringArr);

  // Hotspot data (equivalent to the original hotspots array)
  const hotspots = [
    {
      title: "Interactive Dashboard",
      description:
        "This area contains the main dashboard controls and navigation menu",
      type: "rectangle",
      link: "https://example.com/dashboard",
      coordinates: "50,50 200x150",
    },
    {
      title: "Analytics Hub",
      description:
        "Click here to access detailed analytics and reporting tools",
      type: "circle",
      link: "https://example.com/analytics",
      coordinates: "750,200 r=80",
    },
    {
      title: "Settings Panel",
      description:
        "Configure system settings and user preferences in this area",
      type: "polygon",
      link: "https://example.com/settings",
      coordinates: "Complex polygon shape",
    },
    {
      title: "Help & Support",
      description: "Access documentation and customer support",
      type: "rectangle",
      coordinates: "850,50 120x60",
    },
    {
      title: "User Profile",
      description: "Manage your account settings and profile information",
      type: "circle",
      coordinates: "150,450 r=40",
    },
  ];

  const handleMouseEnter = (hotspot: any) => {
    const content = `
            <strong>${hotspot.title}</strong><br>
            <em>${hotspot.type}</em><br>
            ${hotspot.description}
        `;
    setTooltip((prev) => ({ ...prev, content, visible: true }));
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.closest("svg").getBoundingClientRect();
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
    }));
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleClick = (hotspot) => {
    let linkText = "";
    if (hotspot.link) {
      linkText = `<br><strong>Link:</strong> <a href="${hotspot.link}" target="_blank">${hotspot.link}</a>`;
    }

    const info = `
            <strong>Selected:</strong> ${hotspot.title}<br>
            <strong>Type:</strong> ${hotspot.type}<br>
            <strong>Description:</strong> ${hotspot.description}${linkText}
        `;
    setSelectionInfo(info);
  };

  const HotspotCards = () => (
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
      {hotspots.map((hotspot, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div
            className={`mb-2 inline-block rounded-full px-2 py-1 text-xs font-bold uppercase ${
              hotspot.type === "rectangle"
                ? "bg-blue-100 text-blue-800"
                : hotspot.type === "circle"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {hotspot.type}
          </div>
          <h4 className="mb-2 mt-0 font-semibold text-gray-700">
            {hotspot.title}
          </h4>
          <p className="mb-2 text-gray-600">{hotspot.description}</p>
          <p className="text-sm text-gray-500">
            <strong>Coordinates:</strong> {hotspot.coordinates}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-gray-100 font-sans">
      <div className="rounded-lg bg-white shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">
          Interactive SVG Image Map Prototype
        </h1>
        <p className="mb-4">
          Hover over the colored regions in the image below to see interactive
          hotspots with metadata.
        </p>

        <div className="relative mb-5">
          <svg
            width={900}
            height={600}
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 900 600"
            className=""
          >
            {/* Background pattern to simulate an image */}
            <image
              href="https://plus.unsplash.com/premium_photo-1670360414483-64e6d9ba9038?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740"
              x="0"
              y="0"
              width="900"
              height="600"
              preserveAspectRatio="xMidYMid slice"
            />

            {/* Sample content to make it look like a real image */}
            <rect
              x="0"
              y="0"
              width="200"
              height="150"
              fill="#4caf50"
              opacity="0.7"
              rx="10"
            />

            <text
              x="150"
              y="130"
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              Feature A
            </text>

            <circle cx="750" cy="200" r="80" fill="#ff9800" opacity="0.7" />
            <text
              x="750"
              y="205"
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              Feature B
            </text>

            <polygon
              points="400,400 550,350 600,450 500,500 350,480"
              fill="#e91e63"
              opacity="0.7"
            />
            <text
              x="475"
              y="425"
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              Feature C
            </text>

            {pointStringArr.map((pointString) => {
              return (
                <g
                  key={pointString}
                  className="cursor-pointer transition-all duration-300 hover:drop-shadow-lg"
                  onMouseEnter={() =>
                    handleMouseEnter({
                      title: "This us CUSTOM polygon!",
                      description: "test description",
                      type: "polygon",
                      link: "https://example.com/dashboard",
                      coordinates: pointString,
                    })
                  }
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(hotspots[2])}
                >
                  <polygon points={pointString} fill="#e91e63" opacity="0.7" />
                </g>
              );
            })}

            {/* Rectangle hotspot */}
            <g
              className="cursor-pointer transition-all duration-300 hover:drop-shadow-lg"
              onMouseEnter={() => handleMouseEnter(hotspots[0])}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(hotspots[0])}
              style={{
                stroke: "transparent",
                strokeWidth: 2,
                fill: "transparent",
              }}
            >
              <rect
                x="0"
                y="0"
                width="200"
                height="150"
                fill="transparent"
                stroke="transparent"
                strokeWidth="2"
              />
            </g>

            {/* Circle hotspot */}
            <g
              className="cursor-pointer transition-all duration-300 hover:drop-shadow-lg"
              onMouseEnter={() => handleMouseEnter(hotspots[1])}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(hotspots[1])}
            >
              <circle
                cx="750"
                cy="200"
                r="80"
                fill="transparent"
                stroke="transparent"
                strokeWidth="2"
                className="hover:fill-opacity-30 hover:fill-green-500 hover:stroke-green-500 hover:stroke-[3px]"
              />
            </g>

            {/* Polygon hotspot */}
            <g
              className="cursor-pointer transition-all duration-300 hover:drop-shadow-lg"
              onMouseEnter={() => handleMouseEnter(hotspots[2])}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(hotspots[2])}
            >
              <polygon
                points="400,400 550,350 600,450 500,500 350,480"
                fill="transparent"
                stroke="transparent"
                strokeWidth="2"
                // className="hover:fill-opacity-30 hover:fill-red-500 hover:stroke-red-500 hover:stroke-[3px]" // TODO: change color
              />
            </g>

            {/* Additional smaller hotspots */}
            <g
              className="cursor-pointer transition-all duration-300 hover:drop-shadow-lg"
              onMouseEnter={() => handleMouseEnter(hotspots[3])}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(hotspots[3])}
            >
              <rect
                x="850"
                y="50"
                width="120"
                height="60"
                fill="transparent"
                stroke="transparent"
                strokeWidth="2"
                className="hover:fill-opacity-30 hover:fill-blue-500 hover:stroke-blue-500 hover:stroke-[3px]"
              />
            </g>

            <g
              className="cursor-pointer transition-all duration-300 hover:drop-shadow-lg"
              onMouseEnter={() => handleMouseEnter(hotspots[4])}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(hotspots[4])}
            >
              <circle
                cx="150"
                cy="450"
                r="40"
                fill="transparent"
                stroke="transparent"
                strokeWidth="2"
                className="hover:fill-opacity-30 hover:fill-green-500 hover:stroke-green-500 hover:stroke-[3px]"
              />
            </g>
          </svg>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="pointer-events-none absolute z-50 max-w-64 rounded bg-black bg-opacity-90 p-2.5 text-sm text-white shadow-lg transition-opacity duration-300"
              style={{
                left: tooltip.x + "px",
                top: tooltip.y + "px",
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.content }}
            />
          )}
        </div>

        <div className="mt-5 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <h3 className="mb-2 mt-0 font-semibold text-gray-700">
            Click on any hotspot for more details
          </h3>
          <div
            className="text-gray-600"
            dangerouslySetInnerHTML={{ __html: selectionInfo }}
          />
        </div>

        <HotspotCards />
      </div>
    </div>
  );
};

export default ImageMap;
