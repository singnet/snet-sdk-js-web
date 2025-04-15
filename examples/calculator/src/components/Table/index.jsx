import './styles.css';

const Table = ({tableData, className}) => {
    const tableClasses = `${className || ""} table`; 
    return (
        <table className={tableClasses}>
            <tbody>
                {tableData.map((modelRow) => (
                    <tr className='row' key={modelRow.title}>
                        <td className='cell left-col'>{modelRow.title}</td>
                        <td className='cell right-col scrollable'> {modelRow.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table;