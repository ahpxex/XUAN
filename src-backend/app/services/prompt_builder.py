import json

class PromptBuilder:
    @staticmethod
    def build_system_prompt():
        return """你是一位德高望重的六爻占卜大师，深谙《增删卜易》、《千里命稿》等易学典籍。
你的特点是：
1. **说话接地气**：用通俗易懂的大白话解释卦象，娓娓道来，不要堆砌晦涩的专业术语（如“月破日冲刑克害”等，除非你能马上用白话解释清楚）。
2. **引经据典**：在关键结论处，适当引用一两句古籍原文（如《增删卜易》的断语）来增加权威感，但紧接着要用白话“翻译”给用户听。
3. **直击痛点**：不要只罗列吉凶，要结合用户具体问的事情（如感情、财运、决策），给出具体的行动建议。"""

    @staticmethod
    def build_user_prompt(question, data):
        """
        Construct the prompt from the Hexagram Data.
        Data matches the 'result' returned by NajiaAdapter.
        """
        
        # Extract Key Info
        time = data['time_construct']
        base = data['hexagram']['base']
        bian = data['hexagram']['changed']

        # 1. Background
        prompt = f"""
## 用户求问
**“{question}”**

## 卦象盘面
**起卦时间**：{time['year']['gan_zhi']}年 {time['month']['gan_zhi']}月 {time['day']['gan_zhi']}日 {time['hour']['gan_zhi']}时
**日空**：{time['kong_wang']['day']}

### 本卦：{base['name']} ({base['palace_name']}宫)
"""
        
        # 2. Base Hexagram Lines
        prompt += "\n**爻象详情**：\n"
        for line in reversed(base['lines']):
            # Format: 六神 六亲 爻位 [动] 干支五行 (伏神) [世/应]
            
            god = line['six_god']
            rel = line['relation']
            pos = f"第{line['position']}爻"
            
            # Markers
            move = "【动】" if line['changing'] else ""
            if line['changing']:
                 # If moving, clearly state "Moving turns into..." if we had line-to-line mapping easily.
                 # For now, just mark it moving.
                 pass
            
            role = f"({line['role']})" if line['role'] else ""
            
            # Hidden
            hidden_str = ""
            if line['hidden']:
                 h = line['hidden']
                 hidden_str = f" [伏: {h['relation']}{h['element']}]"

            # Construct line: "第6爻(阴): 勾陈 子孙 酉金 (应)" etc.
            line_str = f"- {pos}: {god} {rel} {line['branch']}{line['element']} {move} {role}{hidden_str}"
            prompt += line_str + "\n"

        # 3. Changed Hexagram
        if bian:
            prompt += f"\n### 变卦：{bian['name']}\n"
            prompt += "**变卦爻象**：\n"
            for line in reversed(bian['lines']):
                prompt += f"- 第{line['position']}爻: {line['relation']} {line['branch']}{line['element']}\n"
        else:
             prompt += "\n(此卦为静卦，无变爻)\n"

        # 4. Instruction
        prompt += """
## 解卦要求
请按照以下逻辑进行口语化解读（不要分那多标题，像聊天一样自然）：

1.  **开场直断**：直接告诉用户结果是吉是凶，或者这事儿成不成。
2.  **大师分析**：
    *   **要通俗**：用大白话解释，比如“代表你这件事的‘父母爻’现在很有力气...”
    *   **取用神**：这事儿看哪个爻？它现在旺不旺？
    *   **看世应**：你和这事儿的关系咋样？是相合（情投意合）还是相冲（不对付）？
    *   **点玄机**：如果有动爻或伏神，说明中间有什么变数或者隐情？
    *   **结问题**：结合用户问题中提出的具体情况进行更具体的分析。
3.  **引经据典**：引用一句《增删卜易》或相关古文来佐证你的看法，并解释它的意思。
4.  **锦囊妙计**：针对这个问题，给用户1-3条具体的建议（时间、方位、做法）。

语气要亲切、肯定，避免模棱两可。如果可以，最后送用户一句祝福。
"""
        return prompt
