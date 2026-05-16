"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const weddingData = {
  bride: {
    cover: { name1: "QUỲNH ANH", name2: "CÔNG TRUNG", date: "THỨ BẢY | 06 . 06 . 2026" },
    announcement: "Lễ Vu Quy",
    parents: [
      { label: "Ông Bà", names: 'Phêrô <strong>NGUYỄN NGỌC QUỲNH</strong><br>Anna <strong>NGUYỄN THỊ KIM LIÊN</strong>', address: "Thôn Hạnh Trí 2, xã Ninh Sơn,<br>tỉnh Khánh Hoà" },
      { label: "Ông Bà", names: 'Giuse <strong>NGUYỄN CÔNG TRỊ (</strong><span class="cross">✝)</span><br>Phanxica <strong>HOÀNG NGỌC HUYỀN</strong>', address: "Thôn Triệu Phong 1, xã Ninh Sơn,<br>tỉnh Khánh Hoà" },
    ],
    couple: {
      first: { christian: "Catarina", name: "NGUYỄN NGỌC QUỲNH ANH", className: "bride-info" },
      second: { christian: "Simon", name: "NGUYỄN CÔNG TRUNG", className: "groom-info" },
      subtitle: "Thứ nữ & Quý nam",
    },
    event: { name: "Thánh lễ Hôn phối cử hành tại", location: "Thánh Đường Giáo Xứ Hạnh Trí", datetime: "Vào lúc 19:00 - Thứ sáu - Ngày 05 . 06 . 2026", lunar: "(Nhằm ngày 20 tháng 04 năm Bính Ngọ)" },
    reception: { mainDate: "06 . 06 . 2026", address: "Thôn Hạnh Trí 2, xã Ninh Sơn, tỉnh Khánh Hoà", timeDate: '17:00<span class="separator">|</span>06 . 06 . 2026', lunar: "(Nhằm ngày 21 tháng 04 năm Bính Ngọ)" },
  },
  groom: {
    cover: { name1: "CÔNG TRUNG", name2: "QUỲNH ANH", date: "CHỦ NHẬT | 07 . 06 . 2026" },
    announcement: "Lễ Thành Hôn",
    parents: [
      { label: "Ông Bà", names: 'Giuse <strong>NGUYỄN CÔNG TRỊ (</strong><span class="cross">✝)</span><br>Phanxica <strong>HOÀNG NGỌC HUYỀN</strong>', address: "Thôn Triệu Phong 1, xã Ninh Sơn,<br>tỉnh Khánh Hoà" },
      { label: "Ông Bà", names: 'Phêrô <strong>NGUYỄN NGỌC QUỲNH</strong><br>Anna <strong>NGUYỄN THỊ KIM LIÊN</strong>', address: "Thôn Hạnh Trí 2, xã Ninh Sơn,<br>tỉnh Khánh Hoà" },
    ],
    couple: {
      first: { christian: "Simon", name: "NGUYỄN CÔNG TRUNG", className: "groom-info" },
      second: { christian: "Catarina", name: "NGUYỄN NGỌC QUỲNH ANH", className: "bride-info" },
      subtitle: "Quý nam & Thứ nữ",
    },
    event: { name: "Thánh lễ Hôn phối cử hành tại", location: "Thánh Đường Giáo Xứ Hạnh Trí", datetime: "Vào lúc 19:00 - Thứ sáu - Ngày 05 . 06 . 2026", lunar: "(Nhằm ngày 20 tháng 04 năm Bính Ngọ)" },
    reception: { mainDate: "07 . 06 . 2026", address: "Thôn Triệu Phong 1, xã Ninh Sơn, tỉnh Khánh Hoà", timeDate: '17:00<span class="separator">|</span>07 . 06 . 2026', lunar: "(Nhằm ngày 22 tháng 04 năm Bính Ngọ)" },
  },
};

type Side = "bride" | "groom";

export default function InvitationExporter() {
  const [side, setSide] = useState<Side>("bride");
  const [invitee, setInvitee] = useState("");
  const [hearts, setHearts] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    // Update side select
    const sideSelect = doc.getElementById("sideSelect") as HTMLSelectElement;
    if (sideSelect) sideSelect.value = side;

    // Update invitee
    const inviteeInput = doc.getElementById("inviteeInput") as HTMLInputElement;
    if (inviteeInput) {
      inviteeInput.value = invitee;
      inviteeInput.dispatchEvent(new Event("input"));
    }

    // Update hearts
    const heartsCheckbox = doc.getElementById("heartsCheckbox") as HTMLInputElement;
    if (heartsCheckbox) {
      heartsCheckbox.checked = hearts;
      heartsCheckbox.dispatchEvent(new Event("change"));
    }

    // Trigger side change
    if (sideSelect) sideSelect.dispatchEvent(new Event("change"));
  }, [side, invitee, hearts]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setTimeout(updateIframe, 200);
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [updateIframe]);

  useEffect(() => {
    updateIframe();
  }, [side, invitee, hearts, updateIframe]);

  const handleExport = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const exportBtn = iframe.contentDocument.getElementById("exportBtn");
    if (exportBtn) exportBtn.click();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Xuất Thiệp Mời</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as Side)}
          className="px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="bride">Nhà gái</option>
          <option value="groom">Nhà trai</option>
        </select>

        <input
          type="text"
          value={invitee}
          onChange={(e) => setInvitee(e.target.value)}
          placeholder="Nhập tên khách mời..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded text-sm"
        />

        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={hearts}
            onChange={(e) => setHearts(e.target.checked)}
          />
          💕
        </label>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-pink-500 text-white rounded text-sm font-medium hover:bg-pink-600"
        >
          Xuất PNG
        </button>
      </div>

      {/* Preview iframe */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/invitation-exporter.html"
          className="w-full h-[800px]"
          title="Invitation Exporter"
        />
      </div>
    </div>
  );
}
