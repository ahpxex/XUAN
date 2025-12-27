"""
Ziwei Dou Shu (Purple Star Astrology) rules module.
Implements Three Parties & Four Areas (sanfang sizheng) and Mutagen (sihua) calculations.
"""

from typing import Any

# Ten Heavenly Stems
HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

# Mutagen Rules (sihua) - Maps heavenly stem to star transformations
# Format: "star->transformation, ..."
# Transformations: 禄 (Wealth/Lu), 权 (Authority/Quan), 科 (Fame/Ke), 忌 (Obstruction/Ji)
MUTAGEN_RULES: dict[str, str] = {
    "甲": "廉贞->禄, 破军->权, 武曲->科, 太阳->忌",
    "乙": "天机->禄, 天梁->权, 紫微->科, 太阴->忌",
    "丙": "天同->禄, 天机->权, 文昌->科, 廉贞->忌",
    "丁": "太阴->禄, 天同->权, 天机->科, 巨门->忌",
    "戊": "贪狼->禄, 太阴->权, 右弼->科, 天机->忌",
    "己": "武曲->禄, 贪狼->权, 天梁->科, 文曲->忌",
    "庚": "太阳->禄, 武曲->权, 太阴->科, 天同->忌",
    "辛": "巨门->禄, 太阳->权, 文曲->科, 文昌->忌",
    "壬": "天梁->禄, 紫微->权, 左辅->科, 武曲->忌",
    "癸": "破军->禄, 巨门->权, 太阴->科, 贪狼->忌",
}


def get_mutagens(stem: str) -> str:
    """
    Get the mutagen (sihua) transformations for a given heavenly stem.

    Args:
        stem: A heavenly stem character (e.g., "甲", "乙", etc.)

    Returns:
        A string describing the star transformations for that stem,
        or "Unknown Stem" if the stem is not recognized.
    """
    return MUTAGEN_RULES.get(stem, "Unknown Stem")


def get_three_parties_four_areas(
    current_index: int, palaces: list[dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    """
    Calculate the Three Parties and Four Areas (sanfang sizheng) for a palace.

    In Zi Wei Dou Shu, each palace is influenced by:
    - Self (本宫): The palace itself
    - Opposite (对宫): The palace directly opposite (index + 6)
    - Triad 1 (三方): The palace at index + 4
    - Triad 2 (三方): The palace at index + 8

    Args:
        current_index: The index of the current palace (0-11)
        palaces: List of all 12 palace dictionaries

    Returns:
        A dictionary containing the four related palaces:
        - self: The current palace
        - opposite: The opposite palace
        - triad1: First triad palace
        - triad2: Second triad palace
    """
    count = len(palaces)  # Should be 12
    idx = current_index % count

    opposite_index = (idx + 6) % count  # 对宫 (180 degrees)
    triad1_index = (idx + 4) % count  # 三方 (120 degrees)
    triad2_index = (idx + 8) % count  # 三方 (240 degrees)

    return {
        "self": palaces[idx],
        "opposite": palaces[opposite_index],
        "triad1": palaces[triad1_index],
        "triad2": palaces[triad2_index],
    }


def format_palace_stars(palace: dict[str, Any]) -> tuple[str, str, str]:
    """
    Format the stars in a palace for display in prompts.

    Args:
        palace: A palace dictionary from the astrolabe

    Returns:
        A tuple of (major_stars, minor_stars, adjective_stars) as formatted strings
    """
    major_stars_list = palace.get("majorStars", [])
    minor_stars_list = palace.get("minorStars", [])
    adjective_stars_list = palace.get("adjectiveStars", [])

    # Format major stars: "name(brightness,mutagen)" or "name(brightness)"
    major_stars = "、".join(
        f"{s.get('name', '')}({s.get('brightness', '-')}"
        + (f",{s.get('mutagen')}" if s.get("mutagen") else "")
        + ")"
        for s in major_stars_list
    )

    # Format minor stars: "name(brightness)"
    minor_stars = "、".join(
        f"{s.get('name', '')}({s.get('brightness', '-')})" for s in minor_stars_list
    )

    # Format adjective stars: just names
    adjective_stars = "、".join(s.get("name", "") for s in adjective_stars_list)

    return (
        major_stars or "None",
        minor_stars or "None",
        adjective_stars or "None",
    )


def format_three_parties_context(
    three_parties: dict[str, dict[str, Any]],
) -> str:
    """
    Format the Three Parties and Four Areas context for the prompt.

    Args:
        three_parties: Result from get_three_parties_four_areas()

    Returns:
        Formatted string describing the three parties relationships
    """

    def fmt(palace: dict[str, Any]) -> str:
        """Format a single palace's major stars."""
        major_stars = palace.get("majorStars", [])
        if not major_stars:
            return "No Major Stars"
        return "、".join(
            f"{s.get('name', '')}({s.get('brightness', '-')})" for s in major_stars
        )

    self_palace = three_parties["self"]
    opposite = three_parties["opposite"]
    triad1 = three_parties["triad1"]
    triad2 = three_parties["triad2"]

    return f"""Three Parties and Four Areas (三方四正):
- Core (本宫 - {self_palace.get('name', '')}): {fmt(self_palace)}
- Opposite (对宫 - {opposite.get('name', '')}): {fmt(opposite)}
- Triad 1 (三方 - {triad1.get('name', '')}): {fmt(triad1)}
- Triad 2 (三方 - {triad2.get('name', '')}): {fmt(triad2)}"""


def format_mutagen_info(palace: dict[str, Any]) -> str:
    """
    Format the mutagen (sihua) information for a palace.

    Args:
        palace: A palace dictionary containing heavenlyStem

    Returns:
        Formatted string describing the palace stem and mutagen flow
    """
    stem = palace.get("heavenlyStem", "")
    if not stem:
        return ""

    mutagens = get_mutagens(stem)
    return f"""Palace Stem (宫干): {stem}
Mutagen Flow (四化): {mutagens}
Instruction: Analyze if these transforming stars appear in the Three Parties."""
