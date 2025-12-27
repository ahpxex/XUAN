import random
from datetime import date as dt_date
from datetime import datetime

import arrow
from najia.najia import Najia


class NajiaAdapter:
    @staticmethod
    def _json_safe(value):
        if isinstance(value, arrow.Arrow):
            return value.isoformat()
        if isinstance(value, (datetime, dt_date)):
            return value.isoformat()
        if isinstance(value, dict):
            return {key: NajiaAdapter._json_safe(val) for key, val in value.items()}
        if isinstance(value, list):
            return [NajiaAdapter._json_safe(val) for val in value]
        if isinstance(value, tuple):
            return [NajiaAdapter._json_safe(val) for val in value]
        if isinstance(value, set):
            return [NajiaAdapter._json_safe(val) for val in value]
        return value

    @staticmethod
    def cast_and_compile(timestamp_iso: str | None = None) -> dict:
        """
        1. Simulate 3-coin tosses to get lines [6,7,8,9]
        2. Convert to Najia format [4,1,2,3]
        3. Compile and return data
        """
        najia_params: list[int] = []
        raw_lines: list[int] = []

        for _ in range(6):
            coins = [random.randint(0, 1) for _ in range(3)]  # 0=Tail(2), 1=Head(3)
            val = sum(3 if c == 1 else 2 for c in coins)

            raw_lines.append(val)

            if val == 7:
                najia_params.append(1)
            elif val == 8:
                najia_params.append(2)
            elif val == 9:
                najia_params.append(3)
            elif val == 6:
                najia_params.append(4)

        date = arrow.get(timestamp_iso) if timestamp_iso else arrow.now()
        date_str = date.format("YYYY-MM-DD HH:mm")

        try:
            compiler = Najia(verbose=0).compile(params=najia_params, date=date_str)
            data = compiler.data
            return NajiaAdapter._transform_to_contract(data, raw_lines, date)
        except Exception as e:
            print(f"Najia Compile Error: {e}")
            raise

    @staticmethod
    def _transform_to_contract(data: dict, raw_lines: list[int], date) -> dict:
        """
        Map Najia data structure to the response contract.
        """
        base_lines: list[dict] = []
        for i in range(6):
            qinx = data["qinx"][i]
            branch = qinx[0]
            element = qinx[1:]

            n_val = data["params"][i]
            is_moving = n_val in [3, 4]
            ying_yang = "Yang" if n_val in [1, 3] else "Yin"

            role = None
            if (i + 1) == data["shiy"][0]:
                role = "世"
            elif (i + 1) == data["shiy"][1]:
                role = "应"

            hidden = None
            if data.get("hide") and i in data["hide"]["seat"]:
                idx_in_hide = data["hide"]["seat"].index(i)
                h_qin = data["hide"]["qin6"][idx_in_hide]
                h_qinx = data["hide"]["qinx"][idx_in_hide]
                hidden = {
                    "relation": h_qin,
                    "branch": h_qinx[0],
                    "element": h_qinx[1:],
                    "note": "伏神",
                }

            line_obj = {
                "position": i + 1,
                "val": raw_lines[i],
                "ying_yang": ying_yang,
                "changing": is_moving,
                "six_god": data["god6"][i],
                "relation": data["qin6"][i],
                "branch": branch,
                "element": element,
                "role": role,
                "hidden": hidden,
            }
            base_lines.append(line_obj)

        palace_map = {
            "乾": "金",
            "兑": "金",
            "离": "火",
            "震": "木",
            "巽": "木",
            "坎": "水",
            "艮": "土",
            "坤": "土",
        }
        p_name = data["gong"][0] if data["gong"] else ""
        p_elem = palace_map.get(p_name, "未知")

        base_obj = {
            "name": data["name"],
            "palace_name": p_name,
            "palace_element": p_elem,
            "lines": base_lines,
        }

        changed_obj = None
        if data.get("bian"):
            b_data = data["bian"]
            b_lines = []
            for i in range(6):
                qinx = b_data["qinx"][i]
                branch = qinx[0]
                element = qinx[1:] if len(qinx) > 1 else ""

                line_obj = {
                    "position": i + 1,
                    "relation": b_data["qin6"][i],
                    "branch": branch,
                    "element": element.strip(),
                    "six_god": "",
                }
                b_lines.append(line_obj)

            changed_obj = {
                "name": b_data["name"],
                "palace_name": b_data["gong"][0] if b_data.get("gong") else "",
                "lines": b_lines,
            }

        return {
            "meta": {
                "timestamp": date.isoformat(),
                "method": "najia_library",
            },
            "time_construct": {
                "year": {"gan_zhi": data["lunar"]["gz"]["year"]},
                "month": {"gan_zhi": data["lunar"]["gz"]["month"]},
                "day": {"gan_zhi": data["lunar"]["gz"]["day"]},
                "hour": {"gan_zhi": data["lunar"]["gz"]["hour"]},
                "kong_wang": {"day": data["lunar"]["xkong"]},
            },
            "hexagram": {
                "base": base_obj,
                "changed": changed_obj,
            },
            "raw_najia": NajiaAdapter._json_safe(data),
        }
