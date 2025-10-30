// Script para limpar dados de demonstração do localStorage
// Execute este script no console do navegador para limpar dados antigos

console.log('🧹 Limpando dados de demonstração...');

const keysToRemove = [
    // Dados mock antigos que podem existir
    'teacher_groups',
    'teacher_activities',
    'superacao_teacher_groups',
    'superacao_teacher_activities',
    
    // Dados de grupos mock específicos
    'group_1',
    'group_2', 
    'activity_1',
    'activity_2',
    
    // Cache de carrossel removido
    'groups_carousel_data',
    'carousel_groups'
];

let removedCount = 0;

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`❌ Removido: ${key}`);
    }
});

// Limpar dados de grupos específicos por padrão
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
        key.includes('Geografia') || 
        key.includes('Inglês') || 
        key.includes('Artes') || 
        key.includes('Ed. Física') ||
        key.includes('group_') ||
        key.includes('activity_')
    )) {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`❌ Removido padrão: ${key}`);
        i--; // Decrementar pois o array mudou
    }
}

console.log(`✅ Limpeza concluída! ${removedCount} itens removidos.`);
console.log('🔄 Recarregue a página para ver as mudanças.');

// Opcional: recarregar automaticamente
// window.location.reload();