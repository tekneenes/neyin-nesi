import { GitHubRepoData, RawExtractedData } from '../types';

export async function extractGitHubRepo(repoUrl: string): Promise<RawExtractedData | null> {
  // Parse owner and repo from URL, e.g., https://github.com/AngelLM/Thor
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!match) return null;

  const owner = match[1];
  const repo = match[2];

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'NeyinNesi-Ingestion-Bot/1.0',
      'Accept': 'application/vnd.github.v3+json',
    };

    // 1. Fetch Repo Metadata from official GitHub API
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!apiRes.ok) {
      throw new Error(`GitHub API returned status ${apiRes.status}`);
    }
    const repoInfo = await apiRes.json();

    // 2. Fetch README.md
    let readmeText = '';
    const branches = ['main', 'master'];
    for (const branch of branches) {
      try {
        const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
        if (readmeRes.ok) {
          readmeText = await readmeRes.text();
          break;
        }
      } catch {
        continue;
      }
    }

    const githubData: GitHubRepoData = {
      owner,
      repo,
      fullName: repoInfo.name || repo,
      description: repoInfo.description || '',
      stars: repoInfo.stargazers_count || 0,
      forks: repoInfo.forks_count || 0,
      license: repoInfo.license?.name || repoInfo.license?.spdx_id || 'Açık Kaynak',
      topics: repoInfo.topics || [],
      readmeText: readmeText.slice(0, 15000), // First 15k chars for AI/spec parsing
      repoUrl,
    };

    return formatGitHubToRawData(githubData);
  } catch (error) {
    console.error(`Failed to fetch GitHub repo ${repoUrl}:`, error);
    return null;
  }
}

function formatGitHubToRawData(data: GitHubRepoData): RawExtractedData {
  const rawSpecs: Array<{ groupName?: string; label: string; value: string }> = [
    { groupName: 'Açık Kaynak Bilgileri', label: 'GitHub Yıldız Sayısı', value: `${data.stars.toLocaleString()} ⭐` },
    { groupName: 'Açık Kaynak Bilgileri', label: 'Lisans Türü', value: data.license },
    { groupName: 'Açık Kaynak Bilgileri', label: 'Depo Sahibi', value: data.owner },
    { groupName: 'Açık Kaynak Bilgileri', label: 'Fork Sayısı', value: `${data.forks}` },
  ];

  if (data.topics.length > 0) {
    rawSpecs.push({
      groupName: 'Açık Kaynak Bilgileri',
      label: 'Etiketler / Teknolojiler',
      value: data.topics.join(', '),
    });
  }

  // Parse common robotic & hardware specs from README text (heuristic search)
  const readmeLower = data.readmeText.toLowerCase();

  // Search for DOF (Degrees of Freedom)
  const dofMatch = readmeLower.match(/(\d+)\s*(?:-|\s*)dof|degrees\s+of\s+freedom\s*:?\s*(\d+)/i);
  if (dofMatch) {
    const dofVal = dofMatch[1] || dofMatch[2];
    rawSpecs.push({ groupName: 'Mekanik & Robotik', label: 'Serbestlik Derecesi (DOF)', value: `${dofVal} Eksen (DOF)` });
  }

  // Search for Payload
  const payloadMatch = readmeLower.match(/payload\s*(?:capacity)?\s*:?\s*(\d+[\s\w]+)/i);
  if (payloadMatch) {
    rawSpecs.push({ groupName: 'Mekanik & Robotik', label: 'Taşıma Kapasitesi (Payload)', value: payloadMatch[1].trim() });
  }

  // Search for controller (Arduino, STM32, ESP32, Raspberry Pi)
  const controllers: string[] = [];
  if (readmeLower.includes('arduino')) controllers.push('Arduino');
  if (readmeLower.includes('esp32')) controllers.push('ESP32');
  if (readmeLower.includes('stm32')) controllers.push('STM32');
  if (readmeLower.includes('raspberry pi') || readmeLower.includes('rpi')) controllers.push('Raspberry Pi');
  if (readmeLower.includes('ramps 1.4') || readmeLower.includes('ramps')) controllers.push('RAMPS 1.4');
  if (controllers.length > 0) {
    rawSpecs.push({ groupName: 'Elektronik & Kontrolcü', label: 'Önerilen Kontrol Kartı', value: controllers.join(' / ') });
  }

  // Manufacturing method
  if (readmeLower.includes('3d print') || readmeLower.includes('stl') || readmeLower.includes('pla')) {
    rawSpecs.push({ groupName: 'Üretim Gereksinimleri', label: 'Üretim Yöntemi', value: '3D Baskı (FDM / PLA / PETG)' });
  }

  return {
    title: `${data.fullName} (Açık Kaynak Donanım)`,
    brand: data.owner,
    model: data.fullName,
    description: data.description,
    categoryName: 'Robotik & Açık Kaynak Donanım',
    categorySlug: 'robotik-acik-kaynak',
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    ],
    price: {
      current: 0,
      currency: 'Açık Kaynak (Ücretsiz Tasarım)',
      sellerName: 'GitHub Açık Kaynak',
    },
    rawSpecs,
    sourceUrl: data.repoUrl,
    sourceType: 'github_repo',
  };
}
