import './styles.css';

const Table = ({tableData, className}) => {
    return (
        <table className={className ? className : 'table'}>
            <tbody>
                {tableData.map((modelRow) => (
                    <tr className='row' key={modelRow.title}>
                        <th scope='row'>{modelRow.title}</th>
                        <td>{modelRow.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table;