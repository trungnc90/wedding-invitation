import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoupleSection from "./CoupleSection";

describe("CoupleSection", () => {
  const defaultProps = {
    bride: {
      firstName: "Quỳnh Anh",
      lastName: "Nguyễn",
      christianName: "Maria",
      photo: "https://lh3.googleusercontent.com/bride-photo",
      bio: "",
      father: { firstName: "Văn A", lastName: "Nguyễn", christianName: "Giuse" },
      mother: { firstName: "Thị B", lastName: "Trần", christianName: "Anna" },
    },
    groom: {
      firstName: "Công Trung",
      lastName: "Lê",
      christianName: "Giuse",
      photo: "https://lh3.googleusercontent.com/groom-photo",
      bio: "",
      father: { firstName: "Văn C", lastName: "Lê", christianName: "Phêrô" },
      mother: { firstName: "Thị D", lastName: "Phạm", christianName: "Maria" },
    },
    loveStory: "Chúng tôi gặp nhau vào mùa thu năm 2020.",
  };

  it("renders bride full name", () => {
    render(<CoupleSection {...defaultProps} />);
    expect(screen.getByText("Nguyễn Quỳnh Anh")).toBeInTheDocument();
  });

  it("renders groom full name", () => {
    render(<CoupleSection {...defaultProps} />);
    expect(screen.getByText("Lê Công Trung")).toBeInTheDocument();
  });

  it("renders christian names", () => {
    render(<CoupleSection {...defaultProps} />);
    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getAllByText("Giuse")).toHaveLength(2); // groom + bride's father
  });

  it("renders bride photo with correct alt text", () => {
    render(<CoupleSection {...defaultProps} />);
    const img = screen.getByAltText("Nguyễn Quỳnh Anh");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
  });

  it("renders groom photo with correct alt text", () => {
    render(<CoupleSection {...defaultProps} />);
    const img = screen.getByAltText("Lê Công Trung");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
  });

  it("renders parent names with christian names", () => {
    render(<CoupleSection {...defaultProps} />);
    expect(screen.getByText(/Cha: Giuse Nguyễn Văn A/)).toBeInTheDocument();
    expect(screen.getByText(/Mẹ: Anna Trần Thị B/)).toBeInTheDocument();
    expect(screen.getByText(/Cha: Phêrô Lê Văn C/)).toBeInTheDocument();
    expect(screen.getByText(/Mẹ: Maria Phạm Thị D/)).toBeInTheDocument();
  });

  it("renders the love story", () => {
    render(<CoupleSection {...defaultProps} />);
    expect(screen.getByText("Chúng tôi gặp nhau vào mùa thu năm 2020.")).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<CoupleSection {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 2, name: /Cô Dâu & Chú Rể/ })).toBeInTheDocument();
  });

  it("renders without parents when not provided", () => {
    const propsNoParents = {
      ...defaultProps,
      bride: { ...defaultProps.bride, father: undefined, mother: undefined },
      groom: { ...defaultProps.groom, father: undefined, mother: undefined },
    };
    render(<CoupleSection {...propsNoParents} />);
    expect(screen.queryByText(/Cha:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mẹ:/)).not.toBeInTheDocument();
  });

  it("renders without christian name when not provided", () => {
    const propsNoChristian = {
      ...defaultProps,
      bride: { ...defaultProps.bride, christianName: undefined },
    };
    render(<CoupleSection {...propsNoChristian} />);
    expect(screen.queryByText("Maria")).not.toBeInTheDocument();
  });
});
