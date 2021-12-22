
import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';


import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {Task, Category, Tag} from '../../common/types';
import { useAxios } from '../../hooks/useAxios';
import TagsInput from '../TagsInput';
import TaskAttachFile from '../TaskAttachFile';
import AttachFile from '../AttachFile';
import {useLocalStorage} from '../../hooks/useLocalStorage';

import axios from 'axios';

type TasksListProps = {
  tasks: Task[];
  category: Category;
  updateTasks: () => void;
}

export type TokenProps = {
  token: string|null
}

type ResponseDeleteTask = {

}

type ResponsePatchTask = {

}

export default function TasksList(props:TasksListProps) {
  const {
    category,
    tasks,
    updateTasks
  } = props;

  const [checked, setChecked] = React.useState([0]);
  const [, setTokenObj] = useLocalStorage<TokenProps>("token", {token:null});

  const {
    commit: commitTask,
    response: taskId
  } = useAxios<ResponseDeleteTask>({
    method: 'DELETE',
    path: `tarefas`
  });

  const {
    commit: commitFinishTask,
  } = useAxios<ResponsePatchTask>({
    method: 'POST',
    path: `tarefas/:id/concluir`
  });

  const {
    commit: commitReopenTask,
  } = useAxios<ResponsePatchTask>({
    method: 'POST',
    path: `tarefas/:id/reabrir`
  });

  const {
    commit: commitAddTag,
  } = useAxios<ResponsePatchTask>({
    method: 'POST',
    path: `tarefas/:id/etiquetas`
  });

  const {
    commit: commitRemoveTag,
  } = useAxios<ResponsePatchTask>({
    method: 'DELETE',
    path: `tarefas/:id/etiquetas`
  });


  const handleDeleteButton = (taskId:number) => {
    const item = window.localStorage.getItem('token');
    const tokenObj: TokenProps = JSON.parse(item!);

    var config = {
      headers: {"Authorization" : `Bearer ${tokenObj!.token}`}
  };

    axios.delete(`http://localhost:8080/tarefas/${taskId}`, config)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    })

  }

  const updateTaskStatus = (taskId:number, status:boolean) => {
    if(status === true) {
      commitFinishTask({}, updateTasks, `tarefas/${taskId}/concluir`)
    } else {
      commitReopenTask({}, updateTasks, `tarefas/${taskId}/reabrir`)
    }
  }
  const addTag = (taskId:number, newTag:Tag) => {

    commitAddTag({
      etiqueta: newTag.etiqueta
    }, updateTasks, `tarefas/${taskId}/etiquetas`)
  }

  const removeTag = (taskId:number, removedTag:Tag) => {

    commitRemoveTag({}, updateTasks, `tarefas/${taskId}/etiquetas/${removedTag.etiqueta}`)
  }

  return (
    <>
    <Typography variant='h4' >
      {category.descricao}
    </Typography>
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {tasks.map((task) => {
        const labelId = `checkbox-list-label-${task.id}`;

        return (
          <Box key={`task_${task.id}`}>
          <ListItem
            key={task.id}
            secondaryAction={
              <Stack direction='row' spacing={1}>
                <TaskAttachFile taskId={task.id} updateTasks={updateTasks}/>
                <Tooltip title='Excluir tarefa'>
                <button onClick={() => handleDeleteButton(task.id)}>Delete Task</button>
                </Tooltip>
              </Stack>
            }
            disablePadding
          >
            <ListItem role={undefined} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.concluida}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => updateTaskStatus(task.id, event.target.checked)}
                />
              </ListItemIcon>
              <ListItemText id={labelId} 
                primary={task.descricao} 
                sx={{textDecoration:task.concluida ? 'line-through' : 'none'}}
                secondary={(
                <TagsInput
                  selectedTags={(newTags) => {}}
                  addTag={(newTag) => addTag(task.id, newTag)}
                  removeTag={(removedTag) => removeTag(task.id, removedTag)}
                  tags={task.etiquetas}
                  placeholder="add Tags"
                />)} 
              />
            </ListItem>
            
          </ListItem>
          <List component="div" disablePadding>
            {
              task.anexos.map((anexo) => {
                return <Box key={`${task.id}_${anexo.id}`}><AttachFile taskId={task.id} anexo={anexo}/></Box>
              })
            }
            </List>
        </Box>
        );
      })}
    </List>
    </>
  );
}