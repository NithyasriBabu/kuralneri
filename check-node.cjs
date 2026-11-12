const requiredMajor = 22;
const currentMajor = Number.parseInt(process.versions.node.split('.')[0], 10);

if (currentMajor < requiredMajor) {
  console.error(
    `Kuralneri requires Node.js ${requiredMajor}+ (found ${process.versions.node}). Run "nvm use" and try again.`,
  );
  process.exit(1);
}
