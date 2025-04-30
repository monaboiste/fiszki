import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn function", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
  });

  it("should handle conditionals", () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
    expect(cn("base", !isActive && "inactive", isDisabled && "disabled")).toBe("base");
  });

  it("should handle object notation", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
    expect(cn("base", { active: false, disabled: true })).toBe("base disabled");
  });

  it("should handle array inputs", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
    expect(cn("base", ["class1", { active: true }])).toBe("base class1 active");
  });

  it("should merge tailwind classes properly", () => {
    // tailwind-merge should handle conflicting classes by using the last one
    const result = cn("p-2 text-red-500", "p-4 text-blue-500");
    expect(result).toBe("p-4 text-blue-500");

    // It should combine non-conflicting classes
    expect(cn("p-2 m-2", "text-blue-500")).toBe("p-2 m-2 text-blue-500");
  });
});
