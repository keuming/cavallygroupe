import { describe, it, expect } from 'vitest';

// Test pour vérifier la structure des niveaux d'éducation
describe('ModernEducationMenu - Education Levels Structure', () => {
  const EDUCATION_CATEGORIES = [
    {
      id: 'maternelle',
      name: 'Maternelle',
      sublevels: [
        { id: 'toute-petite-section', name: 'Toute Petite Section' },
        { id: 'petite-section', name: 'Petite Section' },
        { id: 'moyenne-section', name: 'Moyenne Section' },
        { id: 'grande-section', name: 'Grande Section' },
      ],
    },
    {
      id: 'primaire',
      name: 'Primaire',
      sublevels: [
        { id: 'cp1', name: 'CP1' },
        { id: 'cp2', name: 'CP2' },
        { id: 'ce1', name: 'CE1' },
        { id: 'ce2', name: 'CE2' },
        { id: 'cm1', name: 'CM1' },
        { id: 'cm2', name: 'CM2' },
      ],
    },
    {
      id: 'premier-cycle',
      name: 'Premier Cycle',
      sublevels: [
        { id: '6eme', name: 'Classe de 6ème' },
        { id: '5eme', name: 'Classe de 5ème' },
        { id: '4eme', name: 'Classe de 4ème' },
        { id: '3eme', name: 'Classe de 3ème' },
      ],
    },
    {
      id: 'second-cycle',
      name: 'Second Cycle',
      sublevels: [
        { id: 'seconde-a', name: 'Classe de Seconde A' },
        { id: 'seconde-c', name: 'Classe de Seconde C' },
        { id: 'premiere-a', name: 'Classe de Première A' },
        { id: 'premiere-c', name: 'Classe de Première C' },
        { id: 'premiere-d', name: 'Classe de Première D' },
        { id: 'terminale-a', name: 'Classe de Terminale A' },
        { id: 'terminale-c', name: 'Classe de Terminale C' },
        { id: 'terminale-d', name: 'Classe de Terminale D' },
      ],
    },
    {
      id: 'second-cycle-technique',
      name: 'Second Cycle Technique',
      sublevels: [
        { id: 'seconde-g', name: 'Classe de Seconde G' },
        { id: 'premiere-g', name: 'Classe de Première G' },
        { id: 'terminale-g', name: 'Classe de Terminale G' },
      ],
    },
  ];

  it('should have 5 main education categories', () => {
    expect(EDUCATION_CATEGORIES).toHaveLength(5);
  });

  it('should have correct category names', () => {
    const names = EDUCATION_CATEGORIES.map((cat) => cat.name);
    expect(names).toEqual([
      'Maternelle',
      'Primaire',
      'Premier Cycle',
      'Second Cycle',
      'Second Cycle Technique',
    ]);
  });

  it('should have correct number of sublevels per category', () => {
    expect(EDUCATION_CATEGORIES[0].sublevels).toHaveLength(4); // Maternelle
    expect(EDUCATION_CATEGORIES[1].sublevels).toHaveLength(6); // Primaire
    expect(EDUCATION_CATEGORIES[2].sublevels).toHaveLength(4); // Premier Cycle
    expect(EDUCATION_CATEGORIES[3].sublevels).toHaveLength(8); // Second Cycle
    expect(EDUCATION_CATEGORIES[4].sublevels).toHaveLength(3); // Second Cycle Technique
  });

  it('should have total of 25 education levels', () => {
    const totalLevels = EDUCATION_CATEGORIES.reduce(
      (acc, cat) => acc + (cat.sublevels?.length || 0),
      0
    );
    expect(totalLevels).toBe(25);
  });

  it('should have unique IDs for all categories', () => {
    const ids = EDUCATION_CATEGORIES.map((cat) => cat.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique IDs for all sublevels', () => {
    const allSublevels = EDUCATION_CATEGORIES.flatMap((cat) => cat.sublevels || []);
    const sublevelIds = allSublevels.map((sub) => sub.id);
    const uniqueIds = new Set(sublevelIds);
    expect(uniqueIds.size).toBe(sublevelIds.length);
  });

  it('Maternelle should have correct sublevels', () => {
    const maternelle = EDUCATION_CATEGORIES.find((cat) => cat.id === 'maternelle');
    expect(maternelle?.sublevels?.map((sub) => sub.name)).toEqual([
      'Toute Petite Section',
      'Petite Section',
      'Moyenne Section',
      'Grande Section',
    ]);
  });

  it('Primaire should have correct sublevels', () => {
    const primaire = EDUCATION_CATEGORIES.find((cat) => cat.id === 'primaire');
    expect(primaire?.sublevels?.map((sub) => sub.name)).toEqual([
      'CP1',
      'CP2',
      'CE1',
      'CE2',
      'CM1',
      'CM2',
    ]);
  });

  it('Premier Cycle should have correct sublevels', () => {
    const premierCycle = EDUCATION_CATEGORIES.find((cat) => cat.id === 'premier-cycle');
    expect(premierCycle?.sublevels?.map((sub) => sub.name)).toEqual([
      'Classe de 6ème',
      'Classe de 5ème',
      'Classe de 4ème',
      'Classe de 3ème',
    ]);
  });

  it('Second Cycle should have correct sublevels', () => {
    const secondCycle = EDUCATION_CATEGORIES.find((cat) => cat.id === 'second-cycle');
    expect(secondCycle?.sublevels?.map((sub) => sub.name)).toEqual([
      'Classe de Seconde A',
      'Classe de Seconde C',
      'Classe de Première A',
      'Classe de Première C',
      'Classe de Première D',
      'Classe de Terminale A',
      'Classe de Terminale C',
      'Classe de Terminale D',
    ]);
  });

  it('Second Cycle Technique should have correct sublevels', () => {
    const secondCycleTechnique = EDUCATION_CATEGORIES.find(
      (cat) => cat.id === 'second-cycle-technique'
    );
    expect(secondCycleTechnique?.sublevels?.map((sub) => sub.name)).toEqual([
      'Classe de Seconde G',
      'Classe de Première G',
      'Classe de Terminale G',
    ]);
  });

  it('should support search filtering', () => {
    const searchQuery = 'Terminale';
    const filtered = EDUCATION_CATEGORIES.map((category) => ({
      ...category,
      sublevels: category.sublevels?.filter((sub) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.sublevels && cat.sublevels.length > 0)
    );

    expect(filtered.length).toBeGreaterThan(0);
    const hasTerminale = filtered.some((cat) =>
      cat.sublevels?.some((sub) => sub.name.includes('Terminale'))
    );
    expect(hasTerminale).toBe(true);
  });
});
