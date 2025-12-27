import sys
import os
import arrow
import random

# Add najia_source to path
current_dir = os.path.dirname(os.path.abspath(__file__)) # services
app_dir = os.path.dirname(current_dir) # app
backend_root = os.path.dirname(app_dir) # src-backend
najia_path = os.path.join(backend_root, 'najia_source')

if najia_path not in sys.path:
    sys.path.append(najia_path)

try:
    from najia.najia import Najia
except ImportError:
    print(f"Error: Could not import 'najia' from {najia_path}")
    # Don't raise immediately to allow other things to import, but it will fail at runtime
    pass

class NajiaAdapter:
    @staticmethod
    def cast_and_compile(timestamp_iso=None):
        """
        1. Simulate Coin Toss (3-coin) -> Get lines [6,7,8,9]
        2. Convert to Najia Format [4,1,2,3]
        3. Compile and Return Data
        """
        
        # 1. Coin Toss
        # 3 Heads (9) -> Old Yang -> Najia: 3
        # 3 Tails (6) -> Old Yin -> Najia: 4
        # 1 Head (7) -> Shao Yang -> Najia: 1
        # 2 Heads (8) -> Shao Yin -> Najia: 2
        
        najia_params = []
        raw_lines = []
        
        for _ in range(6):
            # 0=Tail(2), 1=Head(3)
            coins = [random.randint(0, 1) for _ in range(3)]
            val = sum([3 if c==1 else 2 for c in coins])
            
            raw_lines.append(val)
            
            if val == 7: najia_params.append(1)
            elif val == 8: najia_params.append(2)
            elif val == 9: najia_params.append(3)
            elif val == 6: najia_params.append(4)
            
        # 2. Compile
        date = arrow.get(timestamp_iso) if timestamp_iso else arrow.now()
        date_str = date.format('YYYY-MM-DD HH:mm')
        
        # FIX: verbose=0 to prevent NoneType error in najia library
        try:
            compiler = Najia(verbose=0).compile(params=najia_params, date=date_str)
            data = compiler.data
            return NajiaAdapter._transform_to_contract(data, raw_lines, date)
        except Exception as e:
            # Fallback debug
            print(f"Najia Compile Error: {e}")
            raise e

    @staticmethod
    def _transform_to_contract(data, raw_lines, date):
        """
        Map Najia Data Structure to PRD JSON Schema.
        """
        # Time Construct
        lunar = data['lunar']
        
        base_lines = []
        for i in range(6):
            # Parse qinx "子水" -> Branch "子", Element "水"
            qinx = data['qinx'][i]
            branch = qinx[0]
            element = qinx[1:]
            
            # Najia params map: 1=Yang, 2=Yin, 3=OldYang, 4=OldYin
            n_val = data['params'][i]
            is_moving = n_val in [3, 4]
            ying_yang = "Yang" if n_val in [1, 3] else "Yin"
            
            # Role
            role = None
            if (i + 1) == data['shiy'][0]: role = "世"
            elif (i + 1) == data['shiy'][1]: role = "应"
            
            # Hidden
            hidden = None
            if data.get('hide') and i in data['hide']['seat']:
                 idx_in_hide = data['hide']['seat'].index(i)
                 h_qin = data['hide']['qin6'][idx_in_hide]
                 h_qinx = data['hide']['qinx'][idx_in_hide]
                 hidden = {
                     "relation": h_qin,
                     "branch": h_qinx[0],
                     "element": h_qinx[1:],
                     "note": "伏神"
                 }

            line_obj = {
                "position": i + 1,
                "val": raw_lines[i],
                "ying_yang": ying_yang,
                "changing": is_moving,
                "six_god": data['god6'][i],
                "relation": data['qin6'][i],
                "branch": branch,
                "element": element,
                "role": role,
                "hidden": hidden
            }
            base_lines.append(line_obj)

        # Base Hexagram Object
        palace_map = {
            "乾": "金", "兑": "金", "离": "火", "震": "木",
            "巽": "木", "坎": "水", "艮": "土", "坤": "土"
        }
        p_name = data['gong'][0] if data['gong'] else ""
        p_elem = palace_map.get(p_name, "未知")

        base_obj = {
            "name": data['name'],
            "palace_name": p_name, 
            "palace_element": p_elem,
            "lines": base_lines
        }
        
        # Changed Hexagram (Bian Gua)
        changed_obj = None
        if data.get('bian'):
            b_data = data['bian']
            b_lines = []
            for i in range(6):
                qinx = b_data['qinx'][i]
                branch = qinx[0]
                element = qinx[1:] if len(qinx)>1 else ""
                
                line_obj = {
                    "position": i + 1,
                    "relation": b_data['qin6'][i],
                    "branch": branch,
                    "element": element.strip(),
                    "six_god": "", 
                }
                b_lines.append(line_obj)
            
            changed_obj = {
                "name": b_data['name'],
                "palace_name": b_data['gong'][0] if b_data.get('gong') else "",
                "lines": b_lines
            }

        return {
            "meta": {
                "timestamp": date.isoformat(),
                "method": "najia_library"
            },
            "time_construct": {
                "year": {"gan_zhi": data['lunar']['gz']['year']},
                "month": {"gan_zhi": data['lunar']['gz']['month']},
                "day": {"gan_zhi": data['lunar']['gz']['day']},
                "hour": {"gan_zhi": data['lunar']['gz']['hour']},
                "kong_wang": {"day": data['lunar']['xkong']}
            },
            "hexagram": {
                "base": base_obj,
                "changed": changed_obj
            },
            "raw_najia": data 
        }
