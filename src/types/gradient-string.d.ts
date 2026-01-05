declare module 'gradient-string' {
  interface Gradient {
    (text: string): string;
  }

  interface GradientFunction {
    (colors: string[]): Gradient;
    rainbow: Gradient;
    cristal: Gradient;
    teen: Gradient;
    mind: Gradient;
    morning: Gradient;
    vice: Gradient;
    passion: Gradient;
    fruit: Gradient;
    instagram: Gradient;
    atlas: Gradient;
    retro: Gradient;
    summer: Gradient;
    pastel: Gradient;
  }

  const gradient: GradientFunction;
  export default gradient;
}
