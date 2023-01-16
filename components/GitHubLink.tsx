import React from "react";

export default function ThirdwebGuideFooter() {
  const url = "https://linktr.ee/wotify_nfts";
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: -120,
          right: -80,
          height: 300,
          width: 150,
          border: "1px solid #ffffff",
          transform: "rotate(45deg)",
          backgroundColor: "#091a0d",
          cursor: "pointer",
        }}
        role="button"
        onClick={() => window.open(url, "_blank")}
      />

      <div
        style={{
          position: "fixed",
          bottom: 14,
          right: 18,
        }}
      >
        <img
          src={"/links_wotify2.png"} alt="link big font"
          width={45}
          height={45}
          role="button"
          style={{ cursor: "pointer" }}
          onClick={() => window.open(url, "_blank", "noreferrer")}
        />
      </div>
    </>
  );
}
