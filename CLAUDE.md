# XUAN

The XUAN (Chinese metaphysics) app that helps people understand themselves deeper and deeper.

This is a Hackathon project, so please follow the principle of MVP, don't use complicated design and let's get things straightforward.

## Project Architecture

- Frontend, we use TanStack Start and React, at `src`, follow a feature based directory structure.
- Backend, we use FastAPI, LlamaIndex, and Qdrant, at `src-backend`.

## Project Vision

This app collects personal information (name, gender, birth date, exact birth time) and uses traditional Chinese metaphysical systems to provide insights and self-understanding.

## Tech Stack

- TanStack Start (React 19)
- TanStack Router
- Tailwind CSS v4
- iztro, a lightweight kit for generating astrolabes for Zi Wei Dou Shu (The Purple Star Astrology), an ancient Chinese astrology.
- Jotai for state management, just use local storage for data persistence.

- Cloudflare Workers (deployment)

## Design

- Minimalistic brutalist design
- Global dark theme
- Sharp corners, clean typography
- Wide letter-spacing on labels
