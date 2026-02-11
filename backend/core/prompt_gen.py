"""
Prompt Generator Module
Builds AI video generation prompts with spintax support
"""
import re
import random
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


# Style Templates - English prompts for AI generation
STYLE_TEMPLATES = {
    "unboxing": {
        "intro": "{Person} {excitedly|eagerly|enthusiastically} opens a package",
        "action": "{showing|revealing|displaying} the {product_name} inside",
        "highlight": "highlighting {its|the} {highlight}",
        "close": "with {a satisfied|an impressed|a delighted} expression"
    },
    "review": {
        "intro": "{Person} holds the {product_name}",
        "action": "{examining|inspecting|showcasing} {it|the product} closely",
        "highlight": "{demonstrating|showing} how {it|the product} {has|features} {highlight}",
        "close": "{nodding|smiling} {approvingly|with satisfaction}"
    },
    "tutorial": {
        "intro": "{Person} {demonstrates|shows|presents} the {product_name}",
        "action": "{step by step|carefully|thoroughly} {explaining|showing} how to use it",
        "highlight": "emphasizing {the|its} {highlight}",
        "close": "with {clear|easy to follow} {instructions|demonstration}"
    },
    "showcase": {
        "intro": "{Cinematic|Professional|Stunning} shot of {product_name}",
        "action": "{rotating|panning|zooming} to show {all angles|every detail|its beauty}",
        "highlight": "highlighting {the|its} {highlight}",
        "close": "with {elegant|premium|sophisticated} {lighting|presentation}"
    },
    "testimonial": {
        "intro": "{Person} {shares|tells|describes} {their|the} experience with {product_name}",
        "action": "{genuinely|honestly|authentically} {praising|recommending|endorsing} it",
        "highlight": "especially {mentioning|noting|emphasizing} {highlight}",
        "close": "with {genuine|sincere|authentic} {enthusiasm|appreciation}"
    }
}

# Persona definitions
PERSONAS = {
    "wanita_indo": {
        "person": "A stylish Indonesian woman in her {20s|early 30s}",
        "setting": "{modern|minimalist|cozy} {room|living room|studio}",
        "style": "{casual chic|trendy|elegant} outfit"
    },
    "pria_indo": {
        "person": "A {confident|professional|friendly} Indonesian man in his {20s|30s}",
        "setting": "{modern|clean|professional} {room|office|studio}",
        "style": "{smart casual|professional|relaxed} attire"
    },
    "hijabers": {
        "person": "A {beautiful|elegant|stylish} Indonesian woman wearing {a modest|fashionable} hijab",
        "setting": "{bright|warm|aesthetic} {room|interior|space}",
        "style": "{modest|contemporary|beautiful} fashion"
    },
    "product_only": {
        "person": None,
        "setting": "{clean|minimal|studio} background",
        "style": "product-focused shot"
    }
}


def process_spintax(text: str) -> str:
    """
    Process spintax in text, randomly selecting from options
    
    Example: "{Hello|Hi|Hey}" -> "Hi" (randomly selected)
    
    Args:
        text: Text containing spintax patterns
        
    Returns:
        Text with spintax resolved to random choices
    """
    pattern = r'\{([^{}]+)\}'
    
    def replace_match(match):
        options = match.group(1).split('|')
        return random.choice(options)
    
    # Process nested spintax (up to 3 levels)
    for _ in range(3):
        new_text = re.sub(pattern, replace_match, text)
        if new_text == text:
            break
        text = new_text
    
    return text


def build_prompt(
    product_name: str,
    highlight: str,
    style: str,
    persona: str
) -> str:
    """
    Build a complete AI video generation prompt
    
    Args:
        product_name: Name of the product
        highlight: Key feature/benefit to emphasize
        style: One of: unboxing, review, tutorial, showcase, testimonial
        persona: One of: wanita_indo, pria_indo, hijabers, product_only
        
    Returns:
        Complete English prompt with spintax processed
    """
    # Get templates
    style_template = STYLE_TEMPLATES.get(style, STYLE_TEMPLATES["showcase"])
    persona_data = PERSONAS.get(persona, PERSONAS["product_only"])
    
    # Build person description
    if persona_data["person"]:
        person_desc = persona_data["person"]
    else:
        person_desc = ""
    
    # Build the prompt parts
    parts = []
    
    # Intro
    intro = style_template["intro"]
    if "{Person}" in intro:
        if person_desc:
            intro = intro.replace("{Person}", person_desc)
        else:
            intro = intro.replace("{Person}", "The camera")
    intro = intro.replace("{product_name}", product_name)
    parts.append(intro)
    
    # Action
    action = style_template["action"]
    action = action.replace("{product_name}", product_name)
    parts.append(action)
    
    # Highlight
    hl = style_template["highlight"]
    hl = hl.replace("{highlight}", highlight)
    parts.append(hl)
    
    # Setting (if person-based)
    if persona_data["person"]:
        setting = f"in {persona_data['setting']}"
        parts.append(setting)
    
    # Close
    close = style_template["close"]
    parts.append(close)
    
    # Combine and add style notes
    prompt = ", ".join(parts) + "."
    
    # Add video quality instructions
    quality_notes = [
        "{Professional|High quality|Cinematic} video",
        "{smooth|fluid|natural} camera movement",
        "{excellent|perfect|great} lighting",
        "{4K|HD|high resolution} quality"
    ]
    
    prompt += f" {random.choice(quality_notes)}."
    
    # Process all spintax
    final_prompt = process_spintax(prompt)
    
    # Clean up multiple spaces
    final_prompt = re.sub(r'\s+', ' ', final_prompt).strip()
    
    return final_prompt


def generate_batch_prompts(
    product_name: str,
    highlight: str,
    style: str,
    persona: str,
    count: int = 1
) -> list:
    """
    Generate multiple unique prompts for batch processing
    
    Args:
        product_name: Name of the product
        highlight: Key feature/benefit
        style: Video style
        persona: Model persona
        count: Number of prompts to generate
        
    Returns:
        List of unique prompts
    """
    prompts = []
    seen = set()
    max_attempts = count * 10
    attempts = 0
    
    while len(prompts) < count and attempts < max_attempts:
        prompt = build_prompt(product_name, highlight, style, persona)
        
        # Avoid duplicates
        if prompt not in seen:
            prompts.append(prompt)
            seen.add(prompt)
        
        attempts += 1
    
    # If we couldn't get enough unique prompts, just duplicate the last one
    while len(prompts) < count:
        prompts.append(prompts[-1] if prompts else build_prompt(product_name, highlight, style, persona))
    
    return prompts


# Test function
if __name__ == "__main__":
    # Test prompt generation
    prompt = build_prompt(
        product_name="Nike Air Max 270",
        highlight="super lightweight and comfortable for running",
        style="review",
        persona="wanita_indo"
    )
    print("Single prompt:")
    print(prompt)
    print()
    
    # Test batch generation
    print("Batch prompts (3x):")
    prompts = generate_batch_prompts(
        product_name="Samsung Galaxy S24",
        highlight="crystal clear camera with AI enhancement",
        style="unboxing",
        persona="pria_indo",
        count=3
    )
    for i, p in enumerate(prompts, 1):
        print(f"{i}. {p}")
