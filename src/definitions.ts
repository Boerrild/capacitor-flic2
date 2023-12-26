export interface Flic2Plugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
