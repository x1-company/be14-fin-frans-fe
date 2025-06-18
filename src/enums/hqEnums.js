export const departmentMap = [
    {
        id: 2,
        name: '영업팀',
        children: [
            { id: 4, name: '영업1팀' },
            { id: 5, name: '영업2팀' },
            { id: 6, name: '영업3팀' }
        ]
    },
    {
        id: 3,
        name: '물류팀',
        children: [
            { id: 7, name: '물류1팀' },
            { id: 8, name: '물류2팀' },
            { id: 9, name: '물류3팀' }
        ]
    },
    {
        id: 1,
        name: '구매팀',
        children: [] // 상세 부서 없음
    },
    {
        id: 10,
        name: '인사팀',
        children: [] // 상세 부서 없음
    }
]

export const topLevelDepartmentIds = [1, 2, 3, 10];

export const positionMap = {
    1: '사원',
    2: '대리',
    3: '과장',
    4: '차장',
    5: '부장',
    6: '이사',
    7: '전무',
    8: '사장'
}

export const dutyMap = {
    1: '팀원',
    2: '팀장',
    3: '부장'
}

export const getDepartmentNameById = (id) => {
    for (const dept of departmentMap) {
        if (dept.id === id) return dept.name;
        const child = dept.children?.find(child => child.id === id);
        if (child) return child.name;
    }
    return '';
}

export const getTopDepartmentNameById = (id) => {
    const dept = departmentMap.find(d => d.id === id);
    return dept ? dept.name : '';
};